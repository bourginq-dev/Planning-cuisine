-- ==============================================================================
-- SCHEMA SUPABASE POUR PLANNING-CUISINE (Synchronisation Multi-Appareils)
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase (SQL Editor)
-- ==============================================================================

-- 1. Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table: PROFILES (Profil étudiant, budget et matériel de cuisine)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Étudiant',
  plaques INT NOT NULL DEFAULT 2,
  poeles INT NOT NULL DEFAULT 1,
  casseroles INT NOT NULL DEFAULT 1,
  four BOOLEAN NOT NULL DEFAULT false,
  micro BOOLEAN NOT NULL DEFAULT true,
  shopping_day TEXT NOT NULL DEFAULT 'Lundi',
  monthly_budget NUMERIC NOT NULL DEFAULT 140,
  diet_preference TEXT NOT NULL DEFAULT 'all',
  meal_schedule JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Table: RECIPES (Recettes personnalisées créées par l'utilisateur)
CREATE TABLE IF NOT EXISTS public.recipes (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('midi', 'soir')),
  time TEXT NOT NULL DEFAULT '15 min',
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_custom BOOLEAN NOT NULL DEFAULT true,
  custom_nutrition JSONB DEFAULT '{}'::jsonb,
  servings INT DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Table: WEEKLY_PLANS (Planning des 14 repas de la semaine et statuts validés)
CREATE TABLE IF NOT EXISTS public.weekly_plans (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_meals JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Table: SHOPPING_DATA (Courses, Frigo anti-gaspi, notes, magasin et favoris)
CREATE TABLE IF NOT EXISTS public.shopping_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  fridge JSONB NOT NULL DEFAULT '{}'::jsonb,
  extra_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT DEFAULT '',
  store_profile_id TEXT NOT NULL DEFAULT 'standard',
  extra_shopping_recipe_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  actual_paid_amount NUMERIC DEFAULT NULL,
  favorite_recipe_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_season_month INT NOT NULL DEFAULT EXTRACT(MONTH FROM CURRENT_DATE),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- SÉCURITÉ ROW LEVEL SECURITY (RLS) : Chaque utilisateur n'accède qu'à ses données
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_data ENABLE ROW LEVEL SECURITY;

-- Politiques Profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Politiques Recipes
CREATE POLICY "Users can view their custom recipes"
  ON public.recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert custom recipes"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update custom recipes"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete custom recipes"
  ON public.recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Politiques Weekly Plans
CREATE POLICY "Users can view their weekly plan"
  ON public.weekly_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their weekly plan"
  ON public.weekly_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques Shopping Data
CREATE POLICY "Users can view their shopping data"
  ON public.shopping_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their shopping data"
  ON public.shopping_data FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- TEMPS RÉEL (REALTIME) : Synchronisation instantanée entre PC et Smartphone
-- ==============================================================================

-- Activation des notifications en temps réel sur les tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_data;

-- ==============================================================================
-- TRIGGER : Création automatique du profil lors de l'inscription
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Étudiant')
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.weekly_plans (user_id, plan, completed_meals)
  VALUES (NEW.id, '[]'::jsonb, '{}'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO public.shopping_data (user_id, fridge, extra_items)
  VALUES (NEW.id, '{}'::jsonb, '[]'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

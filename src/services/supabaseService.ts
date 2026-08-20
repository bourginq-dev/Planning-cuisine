import { isSupabaseConfigured, supabase } from '../utils/supabaseClient';
import { DayMealPlan, MealType, Recipe, StudentProfile } from '../types';

export interface CloudUserData {
  profile: StudentProfile | null;
  weekPlan: DayMealPlan[];
  completedMeals: Record<string, boolean>;
  fridge: Record<string, number>;
  extraItems: string[];
  notes: string;
  storeProfileId: string;
  customRecipes: Record<MealType, Recipe[]>;
  extraShoppingRecipeIds: string[];
  actualPaidAmount: number | null;
  favoriteRecipeIds: string[];
  selectedSeasonMonth: number;
}

// 1. Charger l'ensemble des données d'un utilisateur depuis Supabase
export async function loadCloudData(userId: string): Promise<CloudUserData | null> {
  if (!isSupabaseConfigured() || !userId) return null;

  try {
    const [
      { data: profileRow, error: profileErr },
      { data: planRow, error: planErr },
      { data: shoppingRow, error: shoppingErr },
      { data: recipesRows, error: recipesErr }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('weekly_plans').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('shopping_data').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('recipes').select('*').eq('user_id', userId)
    ]);

    if (profileErr) console.warn('Erreur chargement profil Supabase:', profileErr);
    if (planErr) console.warn('Erreur chargement planning Supabase:', planErr);
    if (shoppingErr) console.warn('Erreur chargement courses Supabase:', shoppingErr);
    if (recipesErr) console.warn('Erreur chargement recettes Supabase:', recipesErr);

    // Reconstituer le profil
    let profile: StudentProfile | null = null;
    if (profileRow) {
      profile = {
        name: profileRow.name || 'Étudiant',
        plaques: profileRow.plaques ?? 2,
        poeles: profileRow.poeles ?? 1,
        casseroles: profileRow.casseroles ?? 1,
        four: Boolean(profileRow.four),
        micro: Boolean(profileRow.micro),
        shoppingDay: profileRow.shopping_day || 'Lundi',
        monthlyBudget: Number(profileRow.monthly_budget) || 140,
        dietPreference: profileRow.diet_preference || 'all'
      };
    }

    // Reconstituer les recettes custom
    const customRecipes: Record<MealType, Recipe[]> = {
      midi: [],
      soir: []
    };
    if (Array.isArray(recipesRows)) {
      recipesRows.forEach((r: any) => {
        const type: MealType = r.type === 'midi' ? 'midi' : 'soir';
        customRecipes[type].push({
          id: r.id,
          name: r.name,
          type: type,
          time: r.time || '15 min',
          steps: Array.isArray(r.steps) ? r.steps : [],
          ingredients: Array.isArray(r.ingredients) ? r.ingredients : [],
          tags: Array.isArray(r.tags) ? r.tags : [],
          isCustom: true,
          customNutrition: r.custom_nutrition || {},
          servings: r.servings || 1
        });
      });
    }

    // Reconstituer le planning
    const weekPlan: DayMealPlan[] = Array.isArray(planRow?.plan) ? planRow.plan : [];
    const completedMeals: Record<string, boolean> = planRow?.completed_meals || {};

    // Reconstituer shopping data
    const fridge: Record<string, number> = shoppingRow?.fridge || {};
    const extraItems: string[] = Array.isArray(shoppingRow?.extra_items) ? shoppingRow.extra_items : [];
    const notes: string = shoppingRow?.notes || '';
    const storeProfileId: string = shoppingRow?.store_profile_id || 'standard';
    const extraShoppingRecipeIds: string[] = Array.isArray(shoppingRow?.extra_shopping_recipe_ids)
      ? shoppingRow.extra_shopping_recipe_ids
      : [];
    const actualPaidAmount: number | null = shoppingRow?.actual_paid_amount !== undefined && shoppingRow?.actual_paid_amount !== null
      ? Number(shoppingRow.actual_paid_amount)
      : null;
    const favoriteRecipeIds: string[] = Array.isArray(shoppingRow?.favorite_recipe_ids)
      ? shoppingRow.favorite_recipe_ids
      : [];
    const selectedSeasonMonth: number = typeof shoppingRow?.selected_season_month === 'number'
      ? shoppingRow.selected_season_month
      : new Date().getMonth() + 1;

    return {
      profile,
      weekPlan,
      completedMeals,
      fridge,
      extraItems,
      notes,
      storeProfileId,
      customRecipes,
      extraShoppingRecipeIds,
      actualPaidAmount,
      favoriteRecipeIds,
      selectedSeasonMonth
    };
  } catch (error) {
    console.error('Erreur lors du chargement des données Supabase:', error);
    return null;
  }
}

// 2. Synchroniser le profil
export async function syncCloudProfile(userId: string, profile: StudentProfile) {
  if (!isSupabaseConfigured() || !userId || !profile) return;
  try {
    await supabase.from('profiles').upsert({
      id: userId,
      name: profile.name,
      plaques: profile.plaques,
      poeles: profile.poeles,
      casseroles: profile.casseroles,
      four: profile.four,
      micro: profile.micro,
      shopping_day: profile.shoppingDay,
      monthly_budget: profile.monthlyBudget,
      diet_preference: profile.dietPreference || 'all',
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Erreur sync profil Supabase:', err);
  }
}

// 3. Synchroniser le planning de la semaine
export async function syncCloudWeeklyPlan(
  userId: string,
  plan: DayMealPlan[],
  completedMeals: Record<string, boolean>
) {
  if (!isSupabaseConfigured() || !userId) return;
  try {
    await supabase.from('weekly_plans').upsert({
      user_id: userId,
      plan: plan,
      completed_meals: completedMeals,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Erreur sync planning Supabase:', err);
  }
}

// 4. Synchroniser les courses, le frigo et les paramètres
export async function syncCloudShoppingData(
  userId: string,
  data: {
    fridge: Record<string, number>;
    extraItems: string[];
    notes: string;
    storeProfileId: string;
    extraShoppingRecipeIds: string[];
    actualPaidAmount: number | null;
    favoriteRecipeIds: string[];
    selectedSeasonMonth: number;
  }
) {
  if (!isSupabaseConfigured() || !userId) return;
  try {
    await supabase.from('shopping_data').upsert({
      user_id: userId,
      fridge: data.fridge,
      extra_items: data.extraItems,
      notes: data.notes,
      store_profile_id: data.storeProfileId,
      extra_shopping_recipe_ids: data.extraShoppingRecipeIds,
      actual_paid_amount: data.actualPaidAmount,
      favorite_recipe_ids: data.favoriteRecipeIds,
      selected_season_month: data.selectedSeasonMonth,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Erreur sync shopping Supabase:', err);
  }
}

// 5. Sauvegarder / modifier une recette personnalisée
export async function saveCloudRecipe(userId: string, recipe: Recipe) {
  if (!isSupabaseConfigured() || !userId) return;
  try {
    await supabase.from('recipes').upsert({
      id: recipe.id,
      user_id: userId,
      name: recipe.name,
      type: recipe.type,
      time: recipe.time,
      steps: recipe.steps,
      ingredients: recipe.ingredients,
      tags: recipe.tags || [],
      is_custom: true,
      custom_nutrition: recipe.customNutrition || {},
      servings: recipe.servings || 1,
      updated_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Erreur sauvegarde recette Supabase:', err);
  }
}

// 6. Supprimer une recette personnalisée
export async function deleteCloudRecipe(userId: string, recipeId: string) {
  if (!isSupabaseConfigured() || !userId) return;
  try {
    await supabase.from('recipes').delete().eq('id', recipeId).eq('user_id', userId);
  } catch (err) {
    console.warn('Erreur suppression recette Supabase:', err);
  }
}

// 7. Initialiser l'écouteur Temps Réel (Realtime)
export function subscribeToRealtimeChanges(
  userId: string,
  onRemoteChange: () => void
) {
  if (!isSupabaseConfigured() || !userId) return () => {};

  const channel = supabase
    .channel(`public:user:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', filter: `user_id=eq.${userId}` },
      () => {
        onRemoteChange();
      }
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
      () => {
        onRemoteChange();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

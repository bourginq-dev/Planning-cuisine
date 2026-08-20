import React, { useEffect, useMemo, useState } from 'react';
import { AntiGaspiModal } from './components/AntiGaspiModal';
import { BatchPrepModal } from './components/BatchPrepModal';
import { CookingModal } from './components/CookingModal';
import { CustomRecipeModal } from './components/CustomRecipeModal';
import { DishDetailModal } from './components/DishDetailModal';
import { FridgeManager } from './components/FridgeManager';
import { Header } from './components/Header';
import { MonthlyBudgetTracker } from './components/MonthlyBudgetTracker';
import { NutritionDashboard } from './components/NutritionDashboard';
import { Onboarding } from './components/Onboarding';
import { RecipeManager } from './components/RecipeManager';
import { SettingsModal } from './components/SettingsModal';
import { ShoppingList } from './components/ShoppingList';
import { WeeklyPlanning } from './components/WeeklyPlanning';
import { BASE_RECIPES } from './data/recipes';
import { DayMealPlan, MealType, Recipe, StudentProfile } from './types';
import { computeMonthlyBudgetStats, computeReceipt } from './utils/budget';
import { calculateWeeklyNutrition, findRecipeById, getAllRecipes } from './utils/nutrition';
import { generateEcoPlan, generateWeekPlan } from './utils/planner';
import { BookOpen, CookingPot, Lightbulb, Plus, Sparkles, Utensils } from 'lucide-react';

const STORAGE_KEY = 'carnet_etudiant_state_v1';

// Migration helper to sanitize legacy localStorage state (e.g. removing legacy 'matin' entries)
function migrateSavedState(raw: any) {
  if (!raw || typeof raw !== 'object') return null;

  // 1. Sanitize weekPlan: ensure only midi and soir exist on each day
  let cleanPlan: DayMealPlan[] | undefined = undefined;
  if (Array.isArray(raw.weekPlan)) {
    cleanPlan = raw.weekPlan.map((d: any, idx: number) => ({
      day: d.day || `Jour ${idx + 1}`,
      midi: typeof d.midi === 'string' ? d.midi : null,
      soir: typeof d.soir === 'string' ? d.soir : null,
      weekend: Boolean(d.weekend)
    }));
  }

  // 2. Sanitize customRecipes: ensure only midi and soir keys are retained
  let cleanCustomRecipes: Record<MealType, Recipe[]> = {
    midi: [],
    soir: []
  };
  if (raw.customRecipes && typeof raw.customRecipes === 'object') {
    cleanCustomRecipes.midi = Array.isArray(raw.customRecipes.midi) ? raw.customRecipes.midi : [];
    cleanCustomRecipes.soir = Array.isArray(raw.customRecipes.soir) ? raw.customRecipes.soir : [];
    // If user previously had custom matin recipes, preserve them by migrating them to midi or soir if not empty
    if (Array.isArray(raw.customRecipes.matin) && raw.customRecipes.matin.length > 0) {
      raw.customRecipes.matin.forEach((r: Recipe) => {
        cleanCustomRecipes.midi.push({ ...r, type: 'midi' });
      });
    }
  }

  // 3. Sanitize completedMeals: remove any old '*-matin' keys
  const cleanCompleted: Record<string, boolean> = {};
  if (raw.completedMeals && typeof raw.completedMeals === 'object') {
    Object.entries(raw.completedMeals).forEach(([k, v]) => {
      if (!k.endsWith('-matin') && Boolean(v)) {
        cleanCompleted[k] = true;
      }
    });
  }

  return {
    profile: raw.profile || null,
    weekPlan: cleanPlan,
    fridge: raw.fridge || {},
    completedMeals: cleanCompleted,
    extraItems: Array.isArray(raw.extraItems) ? raw.extraItems : [],
    notes: typeof raw.notes === 'string' ? raw.notes : '',
    storeProfileId: typeof raw.storeProfileId === 'string' ? raw.storeProfileId : 'standard',
    customRecipes: cleanCustomRecipes,
    extraShoppingRecipeIds: Array.isArray(raw.extraShoppingRecipeIds) ? raw.extraShoppingRecipeIds : [],
    actualPaidAmount: typeof raw.actualPaidAmount === 'number' ? raw.actualPaidAmount : null
  };
}

export default function App() {
  // App State
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [weekPlan, setWeekPlan] = useState<DayMealPlan[]>([]);
  const [fridge, setFridge] = useState<Record<string, number>>({});
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
  const [extraItems, setExtraItems] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [storeProfileId, setStoreProfileId] = useState<string>('standard');
  const [customRecipes, setCustomRecipes] = useState<Record<MealType, Recipe[]>>({
    midi: [],
    soir: []
  });
  const [extraShoppingRecipeIds, setExtraShoppingRecipeIds] = useState<string[]>([]);
  const [actualPaidAmount, setActualPaidAmount] = useState<number | null>(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'planning' | 'recipes' | 'shopping' | 'budget' | 'nutrition' | 'tools'>('planning');

  // Modals state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [customRecipeOpen, setCustomRecipeOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [antiGaspiOpen, setAntiGaspiOpen] = useState(false);
  const [batchPrepOpen, setBatchPrepOpen] = useState(false);
  const [inspectedRecipe, setInspectedRecipe] = useState<Recipe | null>(null);
  const [cookingRecipe, setCookingRecipe] = useState<{ recipe: Recipe; dayIdx: number; type: MealType } | null>(null);

  // Load from localStorage on mount with migration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const migrated = migrateSavedState(parsed);
        if (migrated) {
          if (migrated.profile) setProfile(migrated.profile);
          if (migrated.weekPlan) setWeekPlan(migrated.weekPlan);
          if (migrated.fridge) setFridge(migrated.fridge);
          if (migrated.completedMeals) setCompletedMeals(migrated.completedMeals);
          if (migrated.extraItems) setExtraItems(migrated.extraItems);
          if (migrated.notes) setNotes(migrated.notes);
          if (migrated.storeProfileId) setStoreProfileId(migrated.storeProfileId);
          if (migrated.customRecipes) setCustomRecipes(migrated.customRecipes);
          if (migrated.extraShoppingRecipeIds) setExtraShoppingRecipeIds(migrated.extraShoppingRecipeIds);
          if (migrated.actualPaidAmount !== null) setActualPaidAmount(migrated.actualPaidAmount);
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage', e);
    }
  }, []);

  // Save to localStorage whenever critical state changes
  useEffect(() => {
    if (!profile) return;
    try {
      const payload = {
        profile,
        weekPlan,
        fridge,
        completedMeals,
        extraItems,
        notes,
        storeProfileId,
        customRecipes,
        extraShoppingRecipeIds,
        actualPaidAmount
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
  }, [profile, weekPlan, fridge, completedMeals, extraItems, notes, storeProfileId, customRecipes, extraShoppingRecipeIds, actualPaidAmount]);

  // Initial Onboarding completion
  const handleOnboardingComplete = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    const initialPlan = generateWeekPlan(newProfile, customRecipes);
    setWeekPlan(initialPlan);
  };

  // Re-generate complete plan
  const handleGenerateRandom = () => {
    if (!profile) return;
    const newPlan = generateWeekPlan(profile, customRecipes);
    setWeekPlan(newPlan);
    setCompletedMeals({});
  };

  const handleGenerateEco = () => {
    if (!profile) return;
    const targetBudgetWeekly = profile.monthlyBudget ? profile.monthlyBudget / 4.33 : 35;
    const ecoResult = generateEcoPlan(profile, targetBudgetWeekly, storeProfileId, customRecipes);
    if (ecoResult) {
      setWeekPlan(ecoResult.plan);
      setCompletedMeals({});
    }
  };

  // Meal slot management
  const handleSetMeal = (dayIdx: number, type: MealType, recipeId: string | null) => {
    setWeekPlan(prev => {
      const next = [...prev];
      if (next[dayIdx]) {
        next[dayIdx] = { ...next[dayIdx], [type]: recipeId };
      }
      return next;
    });
    // Remove completed status if meal changed
    setCompletedMeals(prev => {
      const next = { ...prev };
      delete next[`${dayIdx}-${type}`];
      return next;
    });
  };

  const handleSwapMeals = (d1: number, t1: MealType, d2: number, t2: MealType) => {
    setWeekPlan(prev => {
      const next = [...prev];
      const temp = next[d1][t1];
      next[d1] = { ...next[d1], [t1]: next[d2][t2] };
      next[d2] = { ...next[d2], [t2]: temp };
      return next;
    });

    setCompletedMeals(prev => {
      const next = { ...prev };
      const k1 = `${d1}-${t1}`;
      const k2 = `${d2}-${t2}`;
      const tempDone = next[k1];
      if (next[k2]) next[k1] = next[k2];
      else delete next[k1];
      if (tempDone) next[k2] = tempDone;
      else delete next[k2];
      return next;
    });
  };

  // Fridge management & Deductions
  const handleAddFridgeItem = (id: string, qty: number) => {
    setFridge(prev => {
      const current = prev[id] || 0;
      return { ...prev, [id]: Math.round((current + qty) * 10) / 10 };
    });
  };

  const handleRemoveFridgeItem = (id: string) => {
    setFridge(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleToggleMealDone = (dayIdx: number, type: MealType) => {
    const key = `${dayIdx}-${type}`;
    const recipeId = weekPlan[dayIdx]?.[type];
    if (!recipeId) return;
    const recipe = findRecipeById(type, recipeId, customRecipes);
    if (!recipe) return;

    if (completedMeals[key]) {
      // Annuler : on restitue les ingrédients dans le frigo
      setFridge(prev => {
        const next = { ...prev };
        recipe.ingredients.forEach(({ id, qty }) => {
          next[id] = Math.round(((next[id] || 0) + qty) * 10) / 10;
        });
        return next;
      });
      setCompletedMeals(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else {
      // Déduire du frigo si possible (ou déduire sans bloquer pour souplesse)
      setFridge(prev => {
        const next = { ...prev };
        recipe.ingredients.forEach(({ id, qty }) => {
          const current = next[id] || 0;
          const remaining = Math.max(0, current - qty);
          if (remaining <= 0.05) delete next[id];
          else next[id] = Math.round(remaining * 10) / 10;
        });
        return next;
      });
      setCompletedMeals(prev => ({ ...prev, [key]: true }));
    }
  };

  // Save custom recipe
  const handleSaveCustomRecipe = (type: MealType, newRecipe: Recipe) => {
    setCustomRecipes(prev => ({
      ...prev,
      [type]: [...prev[type], newRecipe]
    }));
  };

  // Update existing custom recipe
  const handleUpdateCustomRecipe = (type: MealType, updatedRecipe: Recipe) => {
    setCustomRecipes(prev => ({
      ...prev,
      [type]: prev[type].map(r => r.id === updatedRecipe.id ? updatedRecipe : r)
    }));
  };

  // Duplicate recipe handler
  const handleDuplicateRecipe = (recipe: Recipe) => {
    const duplicated: Recipe = {
      ...recipe,
      id: `custom-${Date.now()}`,
      name: `${recipe.name} (Copie)`,
      isCustom: true
    };
    setCustomRecipes(prev => ({
      ...prev,
      [recipe.type]: [...(prev[recipe.type] || []), duplicated]
    }));
  };

  // Delete custom recipe
  const handleDeleteCustomRecipe = (type: MealType, recipeId: string) => {
    setCustomRecipes(prev => ({
      ...prev,
      [type]: (prev[type] || []).filter(r => r.id !== recipeId)
    }));
    // Also remove from extra shopping list if present
    setExtraShoppingRecipeIds(prev => prev.filter(id => id !== recipeId));
  };

  // Edit custom recipe launcher
  const handleOpenEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setCustomRecipeOpen(true);
  };

  // Extra shopping recipes management
  const handleAddRecipeToShopping = (recipeId: string) => {
    setExtraShoppingRecipeIds(prev =>
      prev.includes(recipeId) ? prev : [...prev, recipeId]
    );
  };

  const handleRemoveRecipeFromShopping = (recipeId: string) => {
    setExtraShoppingRecipeIds(prev => prev.filter(id => id !== recipeId));
  };

  const handleBulkAddShoppingRecipes = (recipeIds: string[]) => {
    setExtraShoppingRecipeIds(prev => {
      const set = new Set([...prev, ...recipeIds]);
      return Array.from(set);
    });
  };

  const handleClearShoppingRecipes = () => {
    setExtraShoppingRecipeIds([]);
  };

  // Save profile changes (e.g. equipment or shopping day)
  const handleSaveProfile = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    // If shopping day changed, reorder the week plan
    if (profile?.shoppingDay !== newProfile.shoppingDay && weekPlan.length === 7) {
      const newPlan = generateWeekPlan(newProfile, customRecipes);
      setWeekPlan(newPlan);
      setCompletedMeals({});
    }
  };

  // Insert recipe from Anti-Gaspi into the first available slot or current day
  const handleSelectAntiGaspiRecipe = (recipe: Recipe, type: MealType) => {
    let targetDay = 0;
    for (let i = 0; i < weekPlan.length; i++) {
      if (!weekPlan[i][type] || !completedMeals[`${i}-${type}`]) {
        targetDay = i;
        break;
      }
    }
    handleSetMeal(targetDay, type, recipe.id);
    setActiveTab('planning');
  };

  // All combined recipes list
  const allRecipes = useMemo(() => {
    return getAllRecipes(customRecipes);
  }, [customRecipes]);

  // Selected extra recipes for the shopping list
  const extraShoppingRecipes = useMemo(() => {
    return extraShoppingRecipeIds
      .map(id => allRecipes.find(r => r.id === id))
      .filter((r): r is Recipe => Boolean(r));
  }, [extraShoppingRecipeIds, allRecipes]);

  // Calculate live dynamic metrics including extra shopping recipes
  const receiptStats = computeReceipt(
    weekPlan,
    completedMeals,
    fridge,
    storeProfileId,
    customRecipes,
    extraShoppingRecipeIds
  );

  const nutritionStats = calculateWeeklyNutrition(weekPlan, customRecipes);
  const budgetStats = computeMonthlyBudgetStats(
    profile?.monthlyBudget || 140,
    receiptStats.grandTotal,
    receiptStats.bulkSavings,
    storeProfileId,
    actualPaidAmount
  );

  // If no profile, show onboarding
  if (!profile) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#433E37] flex flex-col selection:bg-[#EBF2EA] selection:text-[#3D593A]">
      {/* Top Header */}
      <Header
        profile={profile}
        activeTab={activeTab}
        budgetStats={budgetStats}
        nutritionStats={nutritionStats}
        recipesCount={allRecipes.length}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setSettingsOpen(true)}
        onGenerateRandom={handleGenerateRandom}
        onGenerateEco={handleGenerateEco}
        onOpenNewRecipe={() => {
          setEditingRecipe(null);
          setCustomRecipeOpen(true);
        }}
        onOpenBatchCooking={() => setBatchPrepOpen(true)}
        onOpenAntiGaspi={() => setAntiGaspiOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'planning' && (
          <WeeklyPlanning
            plan={weekPlan}
            completedMeals={completedMeals}
            profile={profile}
            storeProfileId={storeProfileId}
            customRecipes={customRecipes}
            onToggleMealDone={handleToggleMealDone}
            onSetMeal={handleSetMeal}
            onSwapMeals={handleSwapMeals}
            onInspectDish={(recipe) => setInspectedRecipe(recipe)}
            onCookDish={(recipe, dayIdx, type) => setCookingRecipe({ recipe, dayIdx, type })}
          />
        )}

        {activeTab === 'recipes' && (
          <RecipeManager
            profile={profile}
            customRecipes={customRecipes}
            storeProfileId={storeProfileId}
            extraShoppingRecipeIds={extraShoppingRecipeIds}
            weekPlan={weekPlan}
            onOpenCreateRecipe={() => {
              setEditingRecipe(null);
              setCustomRecipeOpen(true);
            }}
            onOpenEditRecipe={handleOpenEditRecipe}
            onDeleteCustomRecipe={handleDeleteCustomRecipe}
            onDuplicateRecipe={handleDuplicateRecipe}
            onAddRecipeToShopping={handleAddRecipeToShopping}
            onAddMultipleRecipesToShopping={handleBulkAddShoppingRecipes}
            onRemoveRecipeFromShopping={handleRemoveRecipeFromShopping}
            onInspectRecipe={(recipe) => setInspectedRecipe(recipe)}
            onCookRecipe={(recipe) => {
              setCookingRecipe({ recipe, dayIdx: 0, type: recipe.type });
            }}
            onAssignToPlan={(dayIdx, type, recipeId) => {
              handleSetMeal(dayIdx, type, recipeId);
              setActiveTab('planning');
            }}
            onNavigateToShopping={() => setActiveTab('shopping')}
          />
        )}

        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <ShoppingList
              receipt={receiptStats}
              currentStoreId={storeProfileId}
              extraItems={extraItems}
              notes={notes}
              extraShoppingRecipes={extraShoppingRecipes}
              actualPaidAmount={actualPaidAmount}
              onSelectStore={setStoreProfileId}
              onAddExtraItem={(text) => setExtraItems(prev => [...prev, text])}
              onRemoveExtraItem={(idx) => setExtraItems(prev => prev.filter((_, i) => i !== idx))}
              onUpdateNotes={setNotes}
              onUpdateActualPaidAmount={setActualPaidAmount}
              onRemoveShoppingRecipe={handleRemoveRecipeFromShopping}
              onClearShoppingRecipes={handleClearShoppingRecipes}
              onNavigateToRecipes={() => setActiveTab('recipes')}
            />

            <FridgeManager
              fridge={fridge}
              onAddFridgeItem={handleAddFridgeItem}
              onRemoveFridgeItem={handleRemoveFridgeItem}
              onOpenAntiGaspi={() => setAntiGaspiOpen(true)}
            />
          </div>
        )}

        {activeTab === 'budget' && (
          <MonthlyBudgetTracker
            stats={budgetStats}
            currentStoreId={storeProfileId}
            onUpdateTargetBudget={(newBudget) => {
              setProfile(prev => prev ? { ...prev, monthlyBudget: newBudget } : null);
            }}
            onSelectStore={setStoreProfileId}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionDashboard
            stats={nutritionStats}
            weekPlan={weekPlan}
            customRecipes={customRecipes}
            onInspectDish={(recipe) => setInspectedRecipe(recipe)}
          />
        )}

        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tool 1: Anti-gaspi */}
              <div
                onClick={() => setAntiGaspiOpen(true)}
                className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs hover:border-[#8BA888] cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] text-[#D97706] flex items-center justify-center border border-[#F4DECA] group-hover:scale-105 transition-transform">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#433E37] text-base">
                  Module Anti-Gaspillage
                </h3>
                <p className="text-xs text-[#7D7569] leading-relaxed">
                  Découvre instantanément les recettes que tu peux cuisiner à 0€ avec les restes déclarés dans ton frigo.
                </p>
                <span className="text-xs font-bold text-[#D97706] block pt-1">
                  Lancer l'anti-gaspi →
                </span>
              </div>

              {/* Tool 2: Batch Cooking */}
              <div
                onClick={() => setBatchPrepOpen(true)}
                className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs hover:border-[#8BA888] cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EBF2EA] text-[#3D593A] flex items-center justify-center border border-[#D1E0CE] group-hover:scale-105 transition-transform">
                  <CookingPot className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#433E37] text-base">
                  Plan de Batch Cooking
                </h3>
                <p className="text-xs text-[#7D7569] leading-relaxed">
                  Identifie les ingrédients récurrents de ta semaine à pré-cuire en une seule session le jour des courses.
                </p>
                <span className="text-xs font-bold text-[#3D593A] block pt-1">
                  Voir la préparation en lot →
                </span>
              </div>

              {/* Tool 3: Custom Recipe & AI */}
              <div
                onClick={() => {
                  setEditingRecipe(null);
                  setCustomRecipeOpen(true);
                }}
                className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs hover:border-[#8BA888] cursor-pointer transition-all space-y-2 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F4F1EB] text-[#433E37] flex items-center justify-center border border-[#E6E1D7] group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#433E37] text-base">
                  Créer ou Importer une Recette
                </h3>
                <p className="text-xs text-[#7D7569] leading-relaxed">
                  Ajoute tes plats familiaux avec ingrédients, instructions et nutrition ou importe en 1 clic une recette avec IA JSON.
                </p>
                <span className="text-xs font-bold text-[#433E37] block pt-1">
                  Ajouter une recette →
                </span>
              </div>
            </div>

            <FridgeManager
              fridge={fridge}
              onAddFridgeItem={handleAddFridgeItem}
              onRemoveFridgeItem={handleRemoveFridgeItem}
              onOpenAntiGaspi={() => setAntiGaspiOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <DishDetailModal
        recipe={inspectedRecipe}
        storeProfileId={storeProfileId}
        isAddedToShopping={inspectedRecipe ? extraShoppingRecipeIds.includes(inspectedRecipe.id) : false}
        onClose={() => setInspectedRecipe(null)}
        onAddToShopping={(recipe) => {
          if (extraShoppingRecipeIds.includes(recipe.id)) {
            handleRemoveRecipeFromShopping(recipe.id);
          } else {
            handleAddRecipeToShopping(recipe.id);
          }
        }}
        onCook={(recipe) => {
          setCookingRecipe({ recipe, dayIdx: 0, type: recipe.type });
        }}
      />

      <CookingModal
        recipe={cookingRecipe?.recipe || null}
        onClose={() => setCookingRecipe(null)}
        onMarkDone={() => {
          if (cookingRecipe) {
            handleToggleMealDone(cookingRecipe.dayIdx, cookingRecipe.type);
          }
        }}
      />

      <AntiGaspiModal
        isOpen={antiGaspiOpen}
        fridge={fridge}
        profile={profile}
        storeProfileId={storeProfileId}
        customRecipes={customRecipes}
        onClose={() => setAntiGaspiOpen(false)}
        onSelectRecipeForPlan={handleSelectAntiGaspiRecipe}
      />

      <BatchPrepModal
        isOpen={batchPrepOpen}
        plan={weekPlan}
        profile={profile}
        customRecipes={customRecipes}
        onClose={() => setBatchPrepOpen(false)}
      />

      <CustomRecipeModal
        isOpen={customRecipeOpen}
        editingRecipe={editingRecipe}
        onClose={() => {
          setCustomRecipeOpen(false);
          setEditingRecipe(null);
        }}
        onSaveRecipe={handleSaveCustomRecipe}
        onUpdateRecipe={handleUpdateCustomRecipe}
      />

      <SettingsModal
        isOpen={settingsOpen}
        profile={profile}
        onClose={() => setSettingsOpen(false)}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}

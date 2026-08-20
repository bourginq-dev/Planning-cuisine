import { ALL_DAYS, BATCH_INGREDIENTS, INGREDIENTS, STORE_PROFILES } from '../data/ingredients';
import { BASE_RECIPES } from '../data/recipes';
import { DayMealPlan, MealType, Recipe, StudentProfile } from '../types';
import { calculateBestPurchase, computeReceipt } from './budget';
import { findRecipeById } from './nutrition';

export function isRecipeAllowed(recipe: Recipe, equipment: StudentProfile): boolean {
  if (!equipment) return true;
  const time = recipe.time.toLowerCase();
  const reqCass = (time.match(/casserole/g) || []).length;
  const reqPoele = (time.match(/poêle/g) || []).length;
  const reqPlaques = reqCass + reqPoele;
  const reqFour = time.includes('four');
  const reqMicro = time.includes('micro-ondes');

  if (reqCass > equipment.casseroles) return false;
  if (reqPoele > equipment.poeles) return false;
  if (reqPlaques > equipment.plaques) return false;
  if (reqFour && !equipment.four) return false;
  if (reqMicro && !equipment.micro) return false;

  return true;
}

export function getValidRecipes(
  type: MealType,
  profile: StudentProfile,
  customRecipes?: Record<MealType, Recipe[]>
): Recipe[] {
  const allBase = BASE_RECIPES[type] || [];
  const custom = customRecipes ? customRecipes[type] || [] : [];
  const combined = [...allBase, ...custom];
  return combined.filter(r => isRecipeAllowed(r, profile));
}

export function isSeasonal(recipe: Recipe, currentMonth: number = new Date().getMonth() + 1): boolean {
  return recipe.ingredients.every(i => {
    const info = INGREDIENTS[i.id];
    if (info && info.season && !info.season.includes(currentMonth)) {
      return false;
    }
    return true;
  });
}

export function pickRandomRecipe(
  pool: Recipe[],
  usedIds: Set<string>,
  type: MealType,
  customRecipes?: Record<MealType, Recipe[]>
): Recipe | null {
  const available = pool.filter(r => !usedIds.has(r.id));
  if (available.length === 0) {
    // Fallback explicite
    const fallback = (BASE_RECIPES[type] || []).find(r => r.isFallback);
    return fallback || pool[0] || null;
  }

  const currentMonth = new Date().getMonth() + 1;
  const seasonal = available.filter(r => isSeasonal(r, currentMonth));
  const outOfSeason = available.filter(r => !isSeasonal(r, currentMonth));

  if (seasonal.length > 0 && outOfSeason.length > 0) {
    // Favoriser la saison à 75%
    if (Math.random() < 0.75) {
      return seasonal[Math.floor(Math.random() * seasonal.length)];
    } else {
      return outOfSeason[Math.floor(Math.random() * outOfSeason.length)];
    }
  }

  return available[Math.floor(Math.random() * available.length)];
}

export function getOrderedDays(shoppingDay: string = 'Lundi'): string[] {
  const idx = ALL_DAYS.indexOf(shoppingDay);
  const start = idx === -1 ? 0 : idx;
  return ALL_DAYS.slice(start).concat(ALL_DAYS.slice(0, start));
}

export function generateWeekPlan(
  profile: StudentProfile,
  customRecipes?: Record<MealType, Recipe[]>
): DayMealPlan[] {
  const validSoir = getValidRecipes('soir', profile, customRecipes);
  const validMidi = getValidRecipes('midi', profile, customRecipes);

  const usedSoir = new Set<string>();
  const soirPicks: (string | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const pick = pickRandomRecipe(validSoir, usedSoir, 'soir', customRecipes);
    soirPicks.push(pick ? pick.id : null);
    if (pick) usedSoir.add(pick.id);
  }

  const usedMidi = new Set<string>();
  const midiPicks: (string | null)[] = [];
  for (let i = 0; i < 7; i++) {
    const pick = pickRandomRecipe(validMidi, usedMidi, 'midi', customRecipes);
    midiPicks.push(pick ? pick.id : null);
    if (pick) usedMidi.add(pick.id);
  }

  const orderedDays = getOrderedDays(profile.shoppingDay);
  return orderedDays.map((day, i) => ({
    day,
    weekend: day === 'Samedi' || day === 'Dimanche',
    midi: midiPicks[i] || null,
    soir: soirPicks[i] || null
  }));
}

export function generateEcoPlan(
  profile: StudentProfile,
  maxBudget: number,
  storeProfileId: string = 'standard',
  customRecipes?: Record<MealType, Recipe[]>
): { plan: DayMealPlan[]; grandTotal: number } | null {
  let bestPlan: DayMealPlan[] | null = null;
  let bestCost = Infinity;

  // Essayer 60 simulations pour trouver le meilleur compromis
  for (let i = 0; i < 60; i++) {
    const candidate = generateWeekPlan(profile, customRecipes);
    const receipt = computeReceipt(candidate, {}, {}, storeProfileId, customRecipes);
    if (receipt.grandTotal < bestCost) {
      bestCost = receipt.grandTotal;
      bestPlan = candidate;
    }
  }

  if (bestPlan && (maxBudget <= 0 || isNaN(maxBudget) || bestCost <= maxBudget)) {
    return { plan: bestPlan, grandTotal: bestCost };
  }

  return bestPlan ? { plan: bestPlan, grandTotal: bestCost } : null;
}

export function findAntiGaspiRecipes(
  fridge: Record<string, number>,
  profile: StudentProfile,
  storeProfileId: string = 'standard',
  customRecipes?: Record<MealType, Recipe[]>
): { recipe: Recipe; type: MealType; missingCost: number; missingNames: string[]; inFridgeCount: number; totalCount: number }[] {
  const results: { recipe: Recipe; type: MealType; missingCost: number; missingNames: string[]; inFridgeCount: number; totalCount: number }[] = [];
  const storeMult = STORE_PROFILES[storeProfileId]?.mult || 1.0;

  (['midi', 'soir'] as MealType[]).forEach(type => {
    const valid = getValidRecipes(type, profile, customRecipes);
    valid.forEach(recipe => {
      let missingCost = 0;
      const missingNames: string[] = [];
      let inFridgeCount = 0;
      const totalCount = recipe.ingredients.length;

      recipe.ingredients.forEach(ing => {
        const inStock = fridge[ing.id] || 0;
        if (inStock >= ing.qty) {
          inFridgeCount++;
        } else {
          missingNames.push(INGREDIENTS[ing.id]?.name || ing.id);
          const needed = ing.qty - inStock;
          const purchase = calculateBestPurchase(ing.id, needed, storeMult);
          if (purchase) missingCost += purchase.cost;
        }
      });

      if (inFridgeCount >= 1 && (missingNames.length <= 1 || missingCost <= 2.50 || inFridgeCount === totalCount)) {
        results.push({
          recipe,
          type,
          missingCost: Math.round(missingCost * 100) / 100,
          missingNames,
          inFridgeCount,
          totalCount
        });
      }
    });
  });

  results.sort((a, b) => a.missingCost - b.missingCost || b.inFridgeCount - a.inFridgeCount);
  return results.slice(0, 10);
}

export function computeBatchCookingPlan(
  plan: DayMealPlan[],
  customRecipes?: Record<MealType, Recipe[]>
): {
  id: string;
  name: string;
  unit: string;
  totalQty: number;
  uses: { day: string; type: MealType; recipeName: string; qty: number }[];
}[] {
  const usage: Record<string, { day: string; type: MealType; recipeName: string; qty: number }[]> = {};

  plan.forEach(d => {
    (['midi', 'soir'] as MealType[]).forEach(type => {
      const rid = d[type];
      if (!rid) return;
      const recipe = findRecipeById(type, rid, customRecipes);
      if (!recipe) return;

      recipe.ingredients.forEach(({ id, qty }) => {
        if (!BATCH_INGREDIENTS.includes(id)) return;
        if (!usage[id]) usage[id] = [];
        usage[id].push({ day: d.day, type, recipeName: recipe.name, qty });
      });
    });
  });

  return Object.entries(usage)
    .filter(([_, list]) => list.length >= 2)
    .map(([id, list]) => ({
      id,
      name: INGREDIENTS[id]?.name || id,
      unit: INGREDIENTS[id]?.unit || 'g',
      totalQty: Math.round(list.reduce((sum, x) => sum + x.qty, 0) * 10) / 10,
      uses: list
    }))
    .sort((a, b) => b.uses.length - a.uses.length);
}

import { ALL_DAYS, BATCH_INGREDIENTS, INGREDIENTS, STORE_PROFILES } from '../data/ingredients';
import { BASE_RECIPES } from '../data/recipes';
import { DayMealPlan, MealHistoryEntry, MealType, Recipe, SmartPlanningOptions, StudentProfile } from '../types';
import { calculateBestPurchase, computeReceipt } from './budget';
import { findRecipeById } from './nutrition';
import { analyzeTupperwareCompatibility, searchSmartFridgeRecipes } from './tupperware';

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

/**
 * Smart recipe selector weighting:
 * - Seasonality (+30 pts)
 * - Avoid repetition from previous weeks (-80 pts if eaten last week, -30 pts if eaten 2 weeks ago)
 * - Favorite frequency (boost +40 pts if favorite hasn't been served in >= 2 weeks, penalize -60 pts if served < 2 weeks ago)
 * - Tupperware compatibility for lunch slots (+50 pts if tupperware-friendly for lunch)
 * - Fridge leftovers emptying bonus (+60 pts if ingredients are already in fridge)
 */
export function pickSmartRecipe(
  pool: Recipe[],
  usedIds: Set<string>,
  type: MealType,
  options?: {
    history?: MealHistoryEntry[];
    favoriteRecipeIds?: string[];
    currentWeekNumber?: number;
    selectedMonth?: number;
    tupperwareForLunch?: boolean;
    fridge?: Record<string, number>;
    customRecipes?: Record<MealType, Recipe[]>;
  }
): Recipe | null {
  const available = pool.filter(r => !usedIds.has(r.id));
  if (available.length === 0) {
    const fallback = (BASE_RECIPES[type] || []).find(r => r.isFallback);
    return fallback || pool[0] || null;
  }

  const currentMonth = options?.selectedMonth || new Date().getMonth() + 1;
  const history = options?.history || [];
  const favoriteRecipeIds = options?.favoriteRecipeIds || [];
  const tupperwareForLunch = options?.tupperwareForLunch !== false;
  const fridge = options?.fridge || {};
  const now = Date.now();

  // Score each candidate
  const scored = available.map(recipe => {
    let weight = 100; // base score

    // 1. Seasonality
    if (isSeasonal(recipe, currentMonth)) {
      weight += 35;
    }

    // 2. Repetition Avoidance (Check history with timestamps or week numbers)
    const historyEntries = history.filter(h => h.recipeId === recipe.id);
    if (historyEntries.length > 0) {
      let mostRecentDaysAgo = 999;
      historyEntries.forEach(h => {
        if (h.cookedAt) {
          const days = (now - h.cookedAt) / (1000 * 3600 * 24);
          if (days < mostRecentDaysAgo) mostRecentDaysAgo = days;
        } else if (h.weekNumber) {
          const curWeek = options?.currentWeekNumber || 1;
          const days = Math.max(0, (curWeek - h.weekNumber) * 7);
          if (days < mostRecentDaysAgo) mostRecentDaysAgo = days;
        } else if (h.date) {
          const diff = (now - new Date(h.date).getTime()) / (1000 * 3600 * 24);
          if (!isNaN(diff) && diff < mostRecentDaysAgo) mostRecentDaysAgo = diff;
        }
      });

      if (mostRecentDaysAgo < 7) {
        weight -= 85; // Eaten within the last 7 days: strongly avoid
      } else if (mostRecentDaysAgo < 14) {
        weight -= 40; // Eaten within last 2 weeks: moderate penalty
      }
    }

    // 3. Favorite prioritization (Max 1 time every 2 weeks rule)
    const isFav = favoriteRecipeIds.includes(recipe.id);
    if (isFav) {
      let mostRecentDaysAgo = 999;
      historyEntries.forEach(h => {
        if (h.cookedAt) {
          const days = (now - h.cookedAt) / (1000 * 3600 * 24);
          if (days < mostRecentDaysAgo) mostRecentDaysAgo = days;
        } else if (h.weekNumber) {
          const curWeek = options?.currentWeekNumber || 1;
          const days = Math.max(0, (curWeek - h.weekNumber) * 7);
          if (days < mostRecentDaysAgo) mostRecentDaysAgo = days;
        }
      });

      if (mostRecentDaysAgo >= 14) {
        // Favorite not eaten for at least 2 weeks: boost priority!
        weight += 50;
      } else {
        // Favorite was eaten recently (< 2 weeks): avoid repeating too soon
        weight -= 50;
      }
    }

    // 4. Tupperware management for Lunch (Midi)
    if (type === 'midi' && tupperwareForLunch) {
      const tup = analyzeTupperwareCompatibility(recipe);
      if (tup.isTupperwareFriendly) {
        weight += 35;
      }
      if (tup.canEatCold) {
        weight += 20; // super convenient for student tupperwares on campus
      }
    }

    // 5. Fridge Emptying Bonus (utilise les restes du frigo)
    let fridgeMatchCount = 0;
    recipe.ingredients.forEach(ing => {
      if (fridge[ing.id] && fridge[ing.id] > 0) {
        fridgeMatchCount++;
      }
    });
    if (fridgeMatchCount > 0) {
      weight += Math.min(70, fridgeMatchCount * 25);
    }

    return { recipe, weight: Math.max(5, weight) };
  });

  // Roulette wheel weighted selection
  const totalWeight = scored.reduce((sum, item) => sum + item.weight, 0);
  let randomVal = Math.random() * totalWeight;

  for (const item of scored) {
    if (randomVal <= item.weight) {
      return item.recipe;
    }
    randomVal -= item.weight;
  }

  return scored[0]?.recipe || available[0] || null;
}

export function pickRandomRecipe(
  pool: Recipe[],
  usedIds: Set<string>,
  type: MealType,
  customRecipes?: Record<MealType, Recipe[]>
): Recipe | null {
  return pickSmartRecipe(pool, usedIds, type, { customRecipes });
}

export function getOrderedDays(shoppingDay: string = 'Lundi'): string[] {
  const idx = ALL_DAYS.indexOf(shoppingDay);
  const start = idx === -1 ? 0 : idx;
  return ALL_DAYS.slice(start).concat(ALL_DAYS.slice(0, start));
}

export function generateWeekPlan(
  profile: StudentProfile,
  customRecipes?: Record<MealType, Recipe[]>,
  options?: {
    history?: MealHistoryEntry[];
    favoriteRecipeIds?: string[];
    currentWeekNumber?: number;
    selectedMonth?: number;
    fridge?: Record<string, number>;
    tupperwareForLunch?: boolean;
    prioritizeFridgeFirst?: boolean;
  }
): DayMealPlan[] {
  const validSoir = getValidRecipes('soir', profile, customRecipes);
  const validMidi = getValidRecipes('midi', profile, customRecipes);
  const orderedDays = getOrderedDays(profile.shoppingDay);
  const mealSchedule = profile.mealSchedule;

  const usedSoir = new Set<string>();
  const usedMidi = new Set<string>();
  const soirPicks: (string | null)[] = [];
  const midiPicks: (string | null)[] = [];

  // 1. Plan Dinners (Soir)
  for (let i = 0; i < orderedDays.length; i++) {
    const day = orderedDays[i];
    const isSoirActive = mealSchedule && mealSchedule[day] ? mealSchedule[day].soir : true;
    if (isSoirActive) {
      const pick = pickSmartRecipe(validSoir, usedSoir, 'soir', {
        history: options?.history,
        favoriteRecipeIds: options?.favoriteRecipeIds,
        currentWeekNumber: options?.currentWeekNumber,
        selectedMonth: options?.selectedMonth,
        fridge: options?.fridge,
        customRecipes
      });
      soirPicks.push(pick ? pick.id : null);
      if (pick) usedSoir.add(pick.id);
    } else {
      soirPicks.push(null);
    }
  }

  // 2. Plan Lunches (Midi) with Tupperware logic
  for (let i = 0; i < orderedDays.length; i++) {
    const day = orderedDays[i];
    const isMidiActive = mealSchedule && mealSchedule[day] ? mealSchedule[day].midi : true;
    if (isMidiActive) {
      const pick = pickSmartRecipe(validMidi, usedMidi, 'midi', {
        history: options?.history,
        favoriteRecipeIds: options?.favoriteRecipeIds,
        currentWeekNumber: options?.currentWeekNumber,
        selectedMonth: options?.selectedMonth,
        fridge: options?.fridge,
        tupperwareForLunch: options?.tupperwareForLunch !== false,
        customRecipes
      });
      midiPicks.push(pick ? pick.id : null);
      if (pick) usedMidi.add(pick.id);
    } else {
      midiPicks.push(null);
    }
  }

  return orderedDays.map((day, i) => ({
    day,
    weekend: day === 'Samedi' || day === 'Dimanche',
    midi: midiPicks[i] || null,
    soir: soirPicks[i] || null
  }));
}

export function generateSmartAntiGaspiPlan(
  fridge: Record<string, number>,
  profile: StudentProfile,
  storeProfileId: string = 'standard',
  customRecipes?: Record<MealType, Recipe[]>,
  options?: {
    history?: MealHistoryEntry[];
    favoriteRecipeIds?: string[];
    currentWeekNumber?: number;
    selectedMonth?: number;
    tupperwareForLunch?: boolean;
  }
): { plan: DayMealPlan[]; matchesCount: number } {
  // First, find fridge-emptying recipes
  const matches = searchSmartFridgeRecipes(fridge, profile, storeProfileId, customRecipes, {
    minFridgeMatch: 1
  });

  const basePlan = generateWeekPlan(profile, customRecipes, {
    ...options,
    fridge,
    prioritizeFridgeFirst: true
  });

  // Inject top fridge matches into early days of the week (to consume perishables first)
  let matchIdx = 0;
  for (let d = 0; d < basePlan.length && matchIdx < matches.length; d++) {
    const dayPlan = basePlan[d];
    const match = matches[matchIdx];

    if (match.type === 'midi' && dayPlan.midi) {
      dayPlan.midi = match.recipe.id;
      matchIdx++;
    } else if (match.type === 'soir' && dayPlan.soir) {
      dayPlan.soir = match.recipe.id;
      matchIdx++;
    }
  }

  return { plan: basePlan, matchesCount: matchIdx };
}

export function generateEcoPlan(
  profile: StudentProfile,
  maxBudget: number,
  storeProfileId: string = 'standard',
  customRecipes?: Record<MealType, Recipe[]>,
  options?: {
    history?: MealHistoryEntry[];
    favoriteRecipeIds?: string[];
    currentWeekNumber?: number;
    selectedMonth?: number;
    fridge?: Record<string, number>;
    tupperwareForLunch?: boolean;
  }
): { plan: DayMealPlan[]; grandTotal: number } | null {
  let bestPlan: DayMealPlan[] | null = null;
  let bestCost = Infinity;

  // Essayer 60 simulations pour trouver le meilleur compromis
  for (let i = 0; i < 60; i++) {
    const candidate = generateWeekPlan(profile, customRecipes, options);
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

import { INGREDIENTS, STORE_PROFILES } from '../data/ingredients';
import { BASE_RECIPES } from '../data/recipes';
import { DayMealPlan, MealType, Recipe, StudentProfile } from '../types';
import { calculateBestPurchase, calculateDishEstimatedCost } from './budget';
import { findRecipeById } from './nutrition';

// Tupperware compatibility rules & analysis
export interface TupperwareAnalysis {
  isTupperwareFriendly: boolean;
  score: number; // 0 à 100
  microwaveScore: number; // 0 à 100 (chauffage au micro-ondes)
  canEatCold: boolean;
  requiresReheat: boolean;
  transportAdvice: string;
  shelfLifeDays: number;
  tags: string[];
}

export function analyzeTupperwareCompatibility(recipe: Recipe): TupperwareAnalysis {
  const nameLower = recipe.name.toLowerCase();
  const tagsLower = (recipe.tags || []).map(t => t.toLowerCase());
  const stepsLower = recipe.steps.join(' ').toLowerCase();

  const isSalad = nameLower.includes('salade') || tagsLower.some(t => t.includes('frais') || t.includes('salade'));
  const isWrap = nameLower.includes('wrap') || tagsLower.some(t => t.includes('wrap') || t.includes('sandwich') || t.includes('croque'));
  const isSoup = nameLower.includes('soupe') || nameLower.includes('velouté') || nameLower.includes('bouillon');
  const isFried = nameLower.includes('croustillant') || nameLower.includes('croque') || nameLower.includes('nugget') || nameLower.includes('poêlé doré');
  const isPasta = nameLower.includes('pâtes') || nameLower.includes('pasta') || nameLower.includes('tagliatelles') || nameLower.includes('spaghetti') || nameLower.includes('coquillettes');
  const isRiceOrQuinoaOrLentils = nameLower.includes('riz') || nameLower.includes('quinoa') || nameLower.includes('lentilles') || nameLower.includes('pois chiches') || nameLower.includes('curry') || nameLower.includes('dahl') || nameLower.includes('chili');

  let canEatCold = false;
  let requiresReheat = true;
  let microwaveScore = 80;
  let transportAdvice = 'Emporter dans une boîte hermétique standard.';
  let shelfLifeDays = 3;
  const derivedTags: string[] = [];

  if (isSalad) {
    canEatCold = true;
    requiresReheat = false;
    microwaveScore = 20;
    transportAdvice = 'Garder la sauce/vinaigrette à part jusqu’au moment de déguster pour garder le croquant.';
    derivedTags.push('Mangeable froid', 'Sans micro-ondes requis');
    shelfLifeDays = 2;
  } else if (isWrap) {
    canEatCold = true;
    requiresReheat = false;
    microwaveScore = 40;
    transportAdvice = 'Emballer dans du papier d’aluminium ou une boîte hermétique pour éviter l’humidité.';
    derivedTags.push('Transport facile', 'Finger food');
    shelfLifeDays = 1;
  } else if (isSoup) {
    canEatCold = false;
    requiresReheat = true;
    microwaveScore = 95;
    transportAdvice = 'Utiliser un bocal hermétique étanche ou un thermos repas chaud.';
    derivedTags.push('Thermos recommandé', 'Réchauffage 2 min');
    shelfLifeDays = 4;
  } else if (isRiceOrQuinoaOrLentils) {
    canEatCold = false;
    requiresReheat = true;
    microwaveScore = 95;
    transportAdvice = 'Idéal en tupperware : ajouter une cuillère d’eau avant de passer au micro-ondes (1 min 30).';
    derivedTags.push('Excellent réchauffé', 'Batch cooking star');
    shelfLifeDays = 4;
  } else if (isPasta) {
    canEatCold = nameLower.includes('salade');
    requiresReheat = !canEatCold;
    microwaveScore = 85;
    transportAdvice = 'Couvrir au micro-ondes pour ne pas assécher les pâtes.';
    derivedTags.push('Réchauffage micro-ondes');
    shelfLifeDays = 3;
  }

  // Check fish sensitivity
  const hasFish = recipe.ingredients.some(i => i.id === 'thon' || i.id === 'saumon' || i.id === 'poisson');
  if (hasFish && !canEatCold) {
    transportAdvice += ' ⚠️ Attention à l’odeur en open-space lors du réchauffage au micro-ondes.';
    microwaveScore = Math.max(40, microwaveScore - 20);
  }

  const isExplicitlyEmportable = tagsLower.some(t => t.includes('emportable') || t.includes('tupperware') || t.includes('lunchbox') || t.includes('bureau') || t.includes('facile à transporter'));
  
  let score = isExplicitlyEmportable ? 95 : (canEatCold ? 90 : (microwaveScore >= 80 ? 85 : 70));

  return {
    isTupperwareFriendly: score >= 70,
    score,
    microwaveScore,
    canEatCold,
    requiresReheat,
    transportAdvice,
    shelfLifeDays,
    tags: derivedTags
  };
}

// Smart Empty-the-Fridge optimizer
export interface FridgeEmptyMatch {
  recipe: Recipe;
  type: MealType;
  fridgeCoveragePct: number; // % of ingredients present
  usedIngredientsCount: number;
  totalIngredientsCount: number;
  inFridgeIngredients: { id: string; name: string; qtyInRecipe: number; qtyInFridge: number; unit: string }[];
  missingIngredients: { id: string; name: string; qtyNeeded: number; cost: number; unit: string }[];
  missingCost: number;
  isTupperwareFriendly: boolean;
  score: number; // prioritization score
}

export function searchSmartFridgeRecipes(
  fridge: Record<string, number>,
  profile: StudentProfile,
  storeProfileId: string = 'standard',
  customRecipes?: Record<MealType, Recipe[]>,
  options?: {
    filterType?: MealType | 'all';
    tupperwareOnly?: boolean;
    quickOnly?: boolean;
    minFridgeMatch?: number; // default 1
  }
): FridgeEmptyMatch[] {
  const storeMult = STORE_PROFILES[storeProfileId]?.mult || 1.0;
  const filterType = options?.filterType || 'all';
  const tupperwareOnly = options?.tupperwareOnly || false;
  const quickOnly = options?.quickOnly || false;
  const minFridgeMatch = options?.minFridgeMatch ?? 1;

  const targetTypes: MealType[] = filterType === 'all' ? ['midi', 'soir'] : [filterType];
  const matches: FridgeEmptyMatch[] = [];

  targetTypes.forEach(type => {
    const pool = BASE_RECIPES[type] || [];
    const custom = customRecipes ? customRecipes[type] || [] : [];
    const combined = [...pool, ...custom];

    combined.forEach(recipe => {
      let inFridgeCount = 0;
      let missingCost = 0;
      const inFridgeIngredients: FridgeEmptyMatch['inFridgeIngredients'] = [];
      const missingIngredients: FridgeEmptyMatch['missingIngredients'] = [];

      recipe.ingredients.forEach(ing => {
        const inStock = fridge[ing.id] || 0;
        const ingInfo = INGREDIENTS[ing.id];
        const ingName = ingInfo?.name || ing.id;
        const ingUnit = ingInfo?.unit || 'g';

        if (inStock >= ing.qty) {
          inFridgeCount++;
          inFridgeIngredients.push({
            id: ing.id,
            name: ingName,
            qtyInRecipe: ing.qty,
            qtyInFridge: inStock,
            unit: ingUnit
          });
        } else if (inStock > 0) {
          inFridgeCount += 0.5; // partial stock
          const needed = ing.qty - inStock;
          const purchase = calculateBestPurchase(ing.id, needed, storeMult);
          const cost = purchase ? purchase.cost : 0;
          missingCost += cost;
          missingIngredients.push({
            id: ing.id,
            name: ingName,
            qtyNeeded: Math.round(needed * 10) / 10,
            cost,
            unit: ingUnit
          });
          inFridgeIngredients.push({
            id: ing.id,
            name: ingName,
            qtyInRecipe: ing.qty,
            qtyInFridge: inStock,
            unit: ingUnit
          });
        } else {
          const purchase = calculateBestPurchase(ing.id, ing.qty, storeMult);
          const cost = purchase ? purchase.cost : 0;
          missingCost += cost;
          missingIngredients.push({
            id: ing.id,
            name: ingName,
            qtyNeeded: ing.qty,
            cost,
            unit: ingUnit
          });
        }
      });

      const totalIngredientsCount = recipe.ingredients.length;
      const coveragePct = Math.min(100, Math.round((inFridgeCount / totalIngredientsCount) * 100));

      if (inFridgeCount >= minFridgeMatch) {
        const tupInfo = analyzeTupperwareCompatibility(recipe);
        if (tupperwareOnly && !tupInfo.isTupperwareFriendly) return;
        if (quickOnly) {
          const mins = parseInt((recipe.time.match(/\d+/) || ['99'])[0], 10);
          if (mins > 15) return;
        }

        // Smart score: high fridge coverage + low missing cost
        let score = (coveragePct * 2) - (missingCost * 15);
        if (coveragePct === 100) score += 50; // 0€ dish bonus

        matches.push({
          recipe,
          type,
          fridgeCoveragePct: coveragePct,
          usedIngredientsCount: Math.floor(inFridgeCount),
          totalIngredientsCount,
          inFridgeIngredients,
          missingIngredients,
          missingCost: Math.round(missingCost * 100) / 100,
          isTupperwareFriendly: tupInfo.isTupperwareFriendly,
          score
        });
      }
    });
  });

  return matches.sort((a, b) => b.score - a.score || a.missingCost - b.missingCost);
}

// History & Anti-Repetition tracking
export interface MealHistoryEntry {
  weekNumber: number; // relative week timestamp or index
  recipeId: string;
  recipeName: string;
  date: string; // ISO date
  type: MealType;
}

export function calculateRepetitionPenalty(
  recipeId: string,
  history: MealHistoryEntry[],
  currentWeekNumber: number
): { penalty: number; lastServedWeeksAgo: number | null } {
  const previousServings = history.filter(h => h.recipeId === recipeId);
  if (previousServings.length === 0) {
    return { penalty: 0, lastServedWeeksAgo: null };
  }

  // Find most recent serving
  const mostRecent = previousServings.reduce((max, curr) => curr.weekNumber > max.weekNumber ? curr : max, previousServings[0]);
  const weeksAgo = currentWeekNumber - mostRecent.weekNumber;

  if (weeksAgo <= 0) {
    return { penalty: 100, lastServedWeeksAgo: 0 }; // Already served this week
  }
  if (weeksAgo === 1) {
    return { penalty: 50, lastServedWeeksAgo: 1 }; // Served last week (penalize to prevent weekly repetition)
  }
  if (weeksAgo === 2) {
    return { penalty: 15, lastServedWeeksAgo: 2 }; // Served 2 weeks ago
  }

  return { penalty: 0, lastServedWeeksAgo: weeksAgo };
}

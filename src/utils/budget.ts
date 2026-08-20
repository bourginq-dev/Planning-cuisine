import { INGREDIENTS, STORE_PROFILES } from '../data/ingredients';
import { BulkPurchaseOption, DayMealPlan, MealType, MonthlyBudgetStats, PurchaseCalculation, ReceiptCalculationResult, ReceiptItem, Recipe } from '../types';
import { findRecipeById } from './nutrition';

export function getBulkOption(ingredientId: string): BulkPurchaseOption | null {
  const info = INGREDIENTS[ingredientId];
  if (!info || (info.unit !== 'g' && info.unit !== 'ml')) return null;
  if (info.pack < 150) return null;

  const mult = info.pack >= 1000 ? 2 : (info.pack >= 400 ? 2.5 : 3);
  let size = info.pack * mult;
  const rounding = size >= 1000 ? 500 : (size >= 300 ? 100 : 50);
  size = Math.round(size / rounding) * rounding;
  if (size <= info.pack) size = info.pack * 2;

  const unitPrice = info.price / info.pack;
  const bulkUnitPrice = unitPrice * 0.82; // 18% d'économie au kilo
  const price = Math.round(bulkUnitPrice * size * 100) / 100;
  return { size, price };
}

export function calculateBestPurchase(id: string, neededQty: number, storeMultiplier: number): PurchaseCalculation | null {
  const info = INGREDIENTS[id];
  if (!info) return null;
  const unitPrice = info.price * storeMultiplier;
  const bulk = getBulkOption(id);

  if (!bulk) {
    const packs = Math.ceil((neededQty - 1e-9) / info.pack);
    return {
      packs,
      packSize: info.pack,
      bulkPacks: 0,
      bulkSize: 0,
      cost: Math.round(packs * unitPrice * 100) / 100
    };
  }

  const bulkPrice = bulk.price * storeMultiplier;
  let best: PurchaseCalculation | null = null;
  const maxBulk = Math.ceil(neededQty / bulk.size);

  for (let b = 0; b <= maxBulk; b++) {
    const remaining = Math.max(0, neededQty - b * bulk.size);
    const s = remaining <= 1e-9 ? 0 : Math.ceil((remaining - 1e-9) / info.pack);
    const cost = Math.round((b * bulkPrice + s * unitPrice) * 100) / 100;
    if (!best || cost < best.cost - 1e-9 || (Math.abs(cost - best.cost) < 1e-9 && b > best.bulkPacks)) {
      best = {
        packs: s,
        packSize: info.pack,
        bulkPacks: b,
        bulkSize: bulk.size,
        cost
      };
    }
  }

  return best;
}

export function computeReceipt(
  plan: DayMealPlan[],
  completedMeals: Record<string, boolean>,
  fridge: Record<string, number>,
  storeProfileId: string = 'standard',
  customRecipes?: Record<MealType, Recipe[]>,
  extraRecipeIds?: string[]
): ReceiptCalculationResult {
  const storeMult = STORE_PROFILES[storeProfileId]?.mult || 1.0;
  const totals: Record<string, number> = {};

  // Ingrédients du planning hebdomadaire (midi et soir)
  plan.forEach((day, dayIndex) => {
    (['midi', 'soir'] as MealType[]).forEach(type => {
      const rid = day[type];
      if (!rid) return;
      if (completedMeals[`${dayIndex}-${type}`]) return; // Déjà cuisiné ou consommé

      const recipe = findRecipeById(type, rid, customRecipes);
      if (!recipe) return;

      recipe.ingredients.forEach(({ id, qty }) => {
        totals[id] = (totals[id] || 0) + qty;
      });
    });
  });

  // Ingrédients ajoutés individuellement depuis le livre de recettes
  if (extraRecipeIds && extraRecipeIds.length > 0) {
    extraRecipeIds.forEach(rid => {
      let recipe: Recipe | null = null;
      for (const t of ['midi', 'soir'] as MealType[]) {
        const found = findRecipeById(t, rid, customRecipes);
        if (found) {
          recipe = found;
          break;
        }
      }
      if (recipe) {
        recipe.ingredients.forEach(({ id, qty }) => {
          totals[id] = (totals[id] || 0) + qty;
        });
      }
    });
  }

  const byCat: Record<string, ReceiptItem[]> = {};
  let grandTotal = 0;
  let bulkSavings = 0;
  let itemCount = 0;

  Object.entries(totals).forEach(([id, qty]) => {
    const inFridge = fridge[id] || 0;
    const needed = Math.max(0, qty - inFridge);
    if (needed <= 0) return;

    const info = INGREDIENTS[id];
    if (!info) return;

    const purchase = calculateBestPurchase(id, needed, storeMult);
    if (!purchase) return;

    grandTotal += purchase.cost;
    itemCount++;

    if (purchase.bulkPacks > 0) {
      const normalPacks = Math.ceil((needed - 1e-9) / info.pack);
      const normalCost = Math.round(normalPacks * info.price * storeMult * 100) / 100;
      if (normalCost > purchase.cost) {
        bulkSavings += (normalCost - purchase.cost);
      }
    }

    if (!byCat[info.cat]) byCat[info.cat] = [];
    byCat[info.cat].push({
      id,
      name: info.name,
      unit: info.unit,
      needed: Math.round(needed * 10) / 10,
      cost: purchase.cost,
      packs: purchase.packs,
      packSize: purchase.packSize,
      bulkPacks: purchase.bulkPacks,
      bulkSize: purchase.bulkSize
    });
  });

  return {
    byCat,
    grandTotal: Math.round(grandTotal * 100) / 100,
    bulkSavings: Math.round(bulkSavings * 100) / 100,
    itemCount
  };
}

export function calculateDishEstimatedCost(recipe: Recipe, storeProfileId: string = 'standard'): number {
  const storeMult = STORE_PROFILES[storeProfileId]?.mult || 1.0;
  let total = 0;
  recipe.ingredients.forEach(({ id, qty }) => {
    const ing = INGREDIENTS[id];
    if (!ing) return;
    const unitCost = (ing.price * storeMult) / ing.pack;
    total += unitCost * qty;
  });
  return Math.round(total * 100) / 100;
}

export function computeMonthlyBudgetStats(
  targetBudget: number,
  weeklyCost: number,
  bulkSavingsWeekly: number,
  storeProfileId: string,
  actualPaidAmount?: number | null
): MonthlyBudgetStats {
  const target = targetBudget > 0 ? targetBudget : 150;
  // 1 mois = 4.33 semaines en moyenne
  const projectedMonthlyCost = Math.round(weeklyCost * 4.33 * 100) / 100;
  const costPerDay = Math.round((weeklyCost / 7) * 100) / 100;
  // 14 repas principaux par semaine (7 déjeuners + 7 dîners)
  const costPerMeal = Math.round((weeklyCost / 14) * 100) / 100;

  const hasActual = typeof actualPaidAmount === 'number' && actualPaidAmount > 0;
  const projectedActualMonthlyCost = hasActual ? Math.round(actualPaidAmount * 4.33 * 100) / 100 : null;
  const actualVsEstimatedDelta = hasActual ? Math.round((actualPaidAmount - weeklyCost) * 100) / 100 : null;

  const effectiveMonthly = projectedActualMonthlyCost !== null ? projectedActualMonthlyCost : projectedMonthlyCost;
  const remainingBudget = Math.round((target - effectiveMonthly) * 100) / 100;
  const percentUsed = Math.round((effectiveMonthly / target) * 100);

  let status: 'optimal' | 'warning' | 'danger' = 'optimal';
  if (percentUsed > 105) status = 'danger';
  else if (percentUsed > 90) status = 'warning';

  const bulkTotalSavingsMonth = Math.round(bulkSavingsWeekly * 4.33 * 100) / 100;

  const optimizationTips: { title: string; saving: string; description: string; tag: string }[] = [];

  if (storeProfileId === 'citadin') {
    optimizationTips.push({
      title: 'Changer de type de magasin pour le gros des courses',
      saving: '≈ 25 à 35€ / mois',
      description: 'Faire un plein en hypermarché ou hard-discount (Lidl/Aldi) au lieu des supérettes réduit immédiatement l’addition.',
      tag: 'Magasin'
    });
  }

  optimizationTips.push({
    title: 'Alterner viandes et protéines végétales / œufs',
    saving: '≈ 15 à 22€ / mois',
    description: 'Remplacer 2 repas viande hachée par des lentilles corail (Dahl) ou œufs brouillés apporte les mêmes protéines pour 3x moins cher.',
    tag: 'Nutrition & Prix'
  });

  optimizationTips.push({
    title: 'Acheter riz, légumineuses et pâtes en formats éco / vrac',
    saving: '≈ 8 à 14€ / mois',
    description: 'Les paquets de 1kg ou 2.5kg offrent un prix au kilo jusqu’à 20% plus bas sur les féculents de base.',
    tag: 'Astuce Vrac'
  });

  optimizationTips.push({
    title: 'Vider le frigo avec l’outil Anti-Gaspi',
    saving: '≈ 10 à 18€ / mois',
    description: 'Cuisiner les restes en fin de semaine évite de jeter l’équivalent d’un repas entier chaque semaine.',
    tag: 'Anti-Gaspi'
  });

  return {
    targetBudget: target,
    weeklyEstimatedCost: weeklyCost,
    projectedMonthlyCost,
    actualPaidAmount: hasActual ? actualPaidAmount : null,
    projectedActualMonthlyCost,
    actualVsEstimatedDelta,
    costPerDay,
    costPerMeal,
    remainingBudget,
    status,
    percentUsed,
    bulkTotalSavingsMonth,
    optimizationTips
  };
}

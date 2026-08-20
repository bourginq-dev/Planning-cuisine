import { INGREDIENTS } from '../data/ingredients';
import { BASE_RECIPES } from '../data/recipes';
import { DayMealPlan, DishNutritionSummary, MealType, NutriScoreGrade, Recipe, WeeklyNutritionStats } from '../types';

export function calculateDishNutrition(recipe: Recipe): DishNutritionSummary {
  let totalCalories = 0;
  let totalProteins = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let totalFiber = 0;
  let totalVegWeight = 0;
  let totalWeightGrams = 0;

  recipe.ingredients.forEach(({ id, qty }) => {
    const ing = INGREDIENTS[id];
    if (!ing) return;

    let grams = 0;
    if (ing.unit === 'g' || ing.unit === 'ml') {
      grams = qty;
    } else if (ing.referenceGrams) {
      grams = qty * ing.referenceGrams;
    } else {
      grams = qty * 100;
    }

    totalWeightGrams += grams;
    const factor = grams / 100;

    totalCalories += ing.nutritionPer100.calories * factor;
    totalProteins += ing.nutritionPer100.proteins * factor;
    totalCarbs += ing.nutritionPer100.carbs * factor;
    totalFats += ing.nutritionPer100.fats * factor;
    totalFiber += ing.nutritionPer100.fiber * factor;

    if (ing.cat === 'Fruits & Légumes' || ing.cat === 'Surgelé' && (id === 'legsurg' || id === 'epinard')) {
      totalVegWeight += grams;
    }
  });

  // Override with custom nutritional values if explicitly provided by user
  if (recipe.customNutrition) {
    if (typeof recipe.customNutrition.calories === 'number' && recipe.customNutrition.calories >= 0) {
      totalCalories = recipe.customNutrition.calories;
    }
    if (typeof recipe.customNutrition.proteins === 'number' && recipe.customNutrition.proteins >= 0) {
      totalProteins = recipe.customNutrition.proteins;
    }
    if (typeof recipe.customNutrition.carbs === 'number' && recipe.customNutrition.carbs >= 0) {
      totalCarbs = recipe.customNutrition.carbs;
    }
    if (typeof recipe.customNutrition.fats === 'number' && recipe.customNutrition.fats >= 0) {
      totalFats = recipe.customNutrition.fats;
    }
    if (typeof recipe.customNutrition.fiber === 'number' && recipe.customNutrition.fiber >= 0) {
      totalFiber = recipe.customNutrition.fiber;
    }
  }

  const vegRatio = totalWeightGrams > 0 ? Math.min(100, Math.round((totalVegWeight / totalWeightGrams) * 100)) : 0;

  // Calcul du NutriScore basé sur l'équilibre
  let negativeScore = 0;
  if (totalCalories > 600) negativeScore += 3;
  else if (totalCalories > 450) negativeScore += 1;

  if (totalFats > 25) negativeScore += 3;
  else if (totalFats > 15) negativeScore += 1;

  let positiveScore = 0;
  if (totalFiber >= 6) positiveScore += 4;
  else if (totalFiber >= 3) positiveScore += 2;

  if (totalProteins >= 22) positiveScore += 4;
  else if (totalProteins >= 14) positiveScore += 2;

  if (vegRatio >= 40) positiveScore += 4;
  else if (vegRatio >= 20) positiveScore += 2;

  const rawScore = negativeScore - positiveScore;
  let nutriScore: NutriScoreGrade = 'B';
  if (rawScore <= -4) nutriScore = 'A';
  else if (rawScore <= -1) nutriScore = 'B';
  else if (rawScore <= 2) nutriScore = 'C';
  else if (rawScore <= 4) nutriScore = 'D';
  else nutriScore = 'E';

  const tags: string[] = [...(recipe.tags || [])];
  const keyHighlights: string[] = [];

  if (totalProteins >= 20) {
    keyHighlights.push(`💪 Riche en protéines (${Math.round(totalProteins)}g)`);
  }
  if (totalFiber >= 5) {
    keyHighlights.push(`🌾 Source de fibres (${Math.round(totalFiber * 10) / 10}g)`);
  }
  if (vegRatio >= 35) {
    keyHighlights.push(`🥗 Bon apport végétal (${vegRatio}%)`);
  }
  if (totalCalories < 380) {
    keyHighlights.push(`🍃 Plat léger (${Math.round(totalCalories)} kcal)`);
  } else if (totalCalories >= 550) {
    keyHighlights.push(`⚡ Très rassasiant (${Math.round(totalCalories)} kcal)`);
  }

  return {
    calories: Math.round(totalCalories),
    proteins: Math.round(totalProteins * 10) / 10,
    carbs: Math.round(totalCarbs * 10) / 10,
    fats: Math.round(totalFats * 10) / 10,
    fiber: Math.round(totalFiber * 10) / 10,
    nutriScore,
    nutriScoreScore: rawScore,
    vegRatio,
    tags,
    keyHighlights
  };
}

export function getAllRecipes(customRecipes?: Record<MealType, Recipe[]>): Recipe[] {
  const list: Recipe[] = [];
  (['midi', 'soir'] as MealType[]).forEach(type => {
    (BASE_RECIPES[type] || []).forEach(r => list.push(r));
    if (customRecipes && customRecipes[type]) {
      customRecipes[type].forEach(r => list.push(r));
    }
  });
  return list;
}

export function findRecipeById(type: MealType, id: string | null, customRecipes?: Record<MealType, Recipe[]>): Recipe | null {
  if (!id) return null;
  const base = BASE_RECIPES[type] || [];
  const custom = customRecipes ? customRecipes[type] || [] : [];
  const found = base.find(r => r.id === id) || custom.find(r => r.id === id);
  if (found) return found;

  // Fallback search in the other category
  for (const t of ['midi', 'soir'] as MealType[]) {
    if (t === type) continue;
    const b = (BASE_RECIPES[t] || []).find(r => r.id === id);
    if (b) return b;
    const c = customRecipes ? (customRecipes[t] || []).find(r => r.id === id) : null;
    if (c) return c;
  }
  return null;
}

export function calculateWeeklyNutrition(
  plan: DayMealPlan[],
  customRecipes?: Record<MealType, Recipe[]>
): WeeklyNutritionStats {
  let totalCalories = 0;
  let totalProteins = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let totalFiber = 0;
  let totalVegServings = 0;
  let mealCount = 0;

  plan.forEach(day => {
    (['midi', 'soir'] as MealType[]).forEach(type => {
      const rid = day[type];
      if (!rid) return;
      const recipe = findRecipeById(type, rid, customRecipes);
      if (!recipe) return;

      mealCount++;
      const summary = calculateDishNutrition(recipe);
      totalCalories += summary.calories;
      totalProteins += summary.proteins;
      totalCarbs += summary.carbs;
      totalFats += summary.fats;
      totalFiber += summary.fiber;

      if (summary.vegRatio >= 25) totalVegServings += 1;
      if (summary.vegRatio >= 50) totalVegServings += 0.5;
    });
  });

  const daysCount = Math.max(1, plan.length);
  const avgDailyCalories = Math.round(totalCalories / daysCount);

  // Répartition macro-nutritionnelle en calories
  const calFromProt = totalProteins * 4;
  const calFromCarb = totalCarbs * 4;
  const calFromFat = totalFats * 9;
  const totalMacroCal = calFromProt + calFromCarb + calFromFat || 1;

  const protPct = Math.round((calFromProt / totalMacroCal) * 100);
  const carbPct = Math.round((calFromCarb / totalMacroCal) * 100);
  const fatPct = Math.round((calFromFat / totalMacroCal) * 100);

  // Scores / 100
  let proteinScore = 100;
  if (protPct < 12) proteinScore = 65;
  else if (protPct > 30) proteinScore = 80;

  const dailyFiber = totalFiber / daysCount;
  const fiberScore = Math.min(100, Math.round((dailyFiber / 22) * 100));

  const dailyVeg = totalVegServings / daysCount;
  const vegScore = Math.min(100, Math.round((dailyVeg / 2.5) * 100));

  const overallScore = Math.round((proteinScore * 0.35) + (fiberScore * 0.35) + (vegScore * 0.30));

  let grade: 'Excellent' | 'Bon' | 'À équilibrer' | 'Trop déséquilibré' = 'Bon';
  if (overallScore >= 85) grade = 'Excellent';
  else if (overallScore >= 70) grade = 'Bon';
  else if (overallScore >= 50) grade = 'À équilibrer';
  else grade = 'Trop déséquilibré';

  const adviceList: { type: 'success' | 'warning' | 'info'; text: string }[] = [];

  if (dailyVeg >= 2) {
    adviceList.push({ type: 'success', text: 'Super diversité de légumes sur tes déjeuners et dîners étudiants !' });
  } else {
    adviceList.push({ type: 'warning', text: 'Pense à glisser une boîte de haricots verts, épinards surgelés ou une salade pour enrichir tes repas.' });
  }

  if (protPct >= 15 && protPct <= 25) {
    adviceList.push({ type: 'success', text: `Apport protéique idéal (${protPct}% des calories) pour l'énergie et la concentration.` });
  } else if (protPct < 15) {
    adviceList.push({ type: 'info', text: 'Ajoute des œufs, lentilles corail ou thon pour booster tes protéines à prix étudiant.' });
  }

  if (dailyFiber >= 18) {
    adviceList.push({ type: 'success', text: `Excellente teneur en fibres (${Math.round(dailyFiber)}g/jour) favorisant une satiété durable pendant les cours.` });
  } else {
    adviceList.push({ type: 'info', text: 'Privilégie les légumes secs (lentilles, pois chiches) et les féculents complets pour réguler ton énergie.' });
  }

  return {
    totalCalories: Math.round(totalCalories),
    avgDailyCalories,
    totalProteins: Math.round(totalProteins),
    totalCarbs: Math.round(totalCarbs),
    totalFats: Math.round(totalFats),
    totalFiber: Math.round(totalFiber),
    macroPercentages: {
      proteins: protPct,
      carbs: carbPct,
      fats: fatPct
    },
    fruitVegServings: Math.round(totalVegServings * 10) / 10,
    fiberScore,
    proteinScore,
    overallScore,
    grade,
    adviceList
  };
}

export type MealType = 'midi' | 'soir';

export type NutriScoreGrade = 'A' | 'B' | 'C' | 'D' | 'E';

export interface NutritionalValues {
  calories: number;   // kcal
  proteins: number;   // g
  carbs: number;      // g
  fats: number;       // g
  fiber: number;      // g
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  pack: number;
  price: number;
  cat: 'Fruits & Légumes' | 'Frais' | 'Surgelé' | 'Boulangerie' | 'Épicerie';
  season?: number[]; // mois 1-12
  nutritionPer100: NutritionalValues; // pour 100g ou 100ml ou 1 pièce normalisée
  referenceGrams?: number; // si l'unité est pièce/boîte/tranche
}

export interface RecipeIngredient {
  id: string;
  qty: number;
}

export interface Recipe {
  id: string;
  name: string;
  type: MealType;
  time: string;
  steps: string[];
  ingredients: RecipeIngredient[];
  tags?: string[];
  isFallback?: boolean;
  isCustom?: boolean;
  customNutrition?: Partial<NutritionalValues>;
  servings?: number;
}

export interface DayMealPlan {
  day: string;
  weekend: boolean;
  midi: string | null;
  soir: string | null;
}

export interface StudentProfile {
  name: string;
  plaques: number;
  poeles: number;
  casseroles: number;
  four: boolean;
  micro: boolean;
  shoppingDay: string;
  monthlyBudget: number;
  dietPreference?: 'all' | 'veggie' | 'high-protein' | 'fast';
}

export interface StoreProfile {
  id: string;
  name: string;
  mult: number;
  badge: string;
  description: string;
}

export interface DishNutritionSummary {
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  fiber: number;
  nutriScore: NutriScoreGrade;
  nutriScoreScore: number;
  vegRatio: number; // 0-100%
  tags: string[];
  keyHighlights: string[];
}

export interface WeeklyNutritionStats {
  totalCalories: number;
  avgDailyCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
  totalFiber: number;
  macroPercentages: {
    proteins: number;
    carbs: number;
    fats: number;
  };
  fruitVegServings: number;
  fiberScore: number; // /100
  proteinScore: number; // /100
  overallScore: number; // /100
  grade: 'Excellent' | 'Bon' | 'À équilibrer' | 'Trop déséquilibré';
  adviceList: {
    type: 'success' | 'warning' | 'info';
    text: string;
  }[];
}

export interface BulkPurchaseOption {
  size: number;
  price: number;
}

export interface PurchaseCalculation {
  packs: number;
  packSize: number;
  bulkPacks: number;
  bulkSize: number;
  cost: number;
}

export interface ReceiptItem {
  id: string;
  name: string;
  unit: string;
  needed: number;
  cost: number;
  packs: number;
  packSize: number;
  bulkPacks: number;
  bulkSize: number;
}

export interface ReceiptCalculationResult {
  byCat: Record<string, ReceiptItem[]>;
  grandTotal: number;
  bulkSavings: number;
  itemCount: number;
}

export interface MonthlyBudgetStats {
  targetBudget: number;
  weeklyEstimatedCost: number;
  projectedMonthlyCost: number;
  actualPaidAmount?: number | null;
  projectedActualMonthlyCost?: number | null;
  actualVsEstimatedDelta?: number | null;
  costPerDay: number;
  costPerMeal: number;
  remainingBudget: number;
  status: 'optimal' | 'warning' | 'danger';
  percentUsed: number;
  bulkTotalSavingsMonth: number;
  optimizationTips: {
    title: string;
    saving: string;
    description: string;
    tag: string;
  }[];
}

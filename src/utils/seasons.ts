import { INGREDIENTS } from '../data/ingredients';
import { Recipe } from '../types';

export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonInfo {
  key: SeasonKey;
  label: string;
  emoji: string;
  months: number[]; // 1 to 12
  periodName: string;
}

export const SEASONS: Record<SeasonKey, SeasonInfo> = {
  spring: {
    key: 'spring',
    label: 'Printemps',
    emoji: '🌸',
    months: [3, 4, 5],
    periodName: 'Mars – Mai'
  },
  summer: {
    key: 'summer',
    label: 'Été',
    emoji: '☀️',
    months: [6, 7, 8],
    periodName: 'Juin – Août'
  },
  autumn: {
    key: 'autumn',
    label: 'Automne',
    emoji: '🍂',
    months: [9, 10, 11],
    periodName: 'Septembre – Novembre'
  },
  winter: {
    key: 'winter',
    label: 'Hiver',
    emoji: '❄️',
    months: [12, 1, 2],
    periodName: 'Décembre – Février'
  }
};

export const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

export function getCurrentMonth(): number {
  return new Date().getMonth() + 1; // 1-12
}

export function getSeasonForMonth(month: number): SeasonInfo {
  if ([3, 4, 5].includes(month)) return SEASONS.spring;
  if ([6, 7, 8].includes(month)) return SEASONS.summer;
  if ([9, 10, 11].includes(month)) return SEASONS.autumn;
  return SEASONS.winter;
}

export function getCurrentSeason(): SeasonInfo {
  return getSeasonForMonth(getCurrentMonth());
}

export function formatMonthRange(months?: number[]): string {
  if (!months || months.length === 0 || months.length === 12) {
    return "Toute l'année";
  }
  return months.map(m => MONTH_NAMES_FR[m - 1]).join(', ');
}

export interface RecipeSeasonAnalysis {
  isAllInSeason: boolean;
  hasSeasonalProduce: boolean;
  produceCount: number;
  inSeasonProduce: { id: string; name: string }[];
  outOfSeasonProduce: { id: string; name: string; bestMonths: string }[];
  badgeType: 'in-season' | 'out-of-season' | 'year-round';
  summaryLabel: string;
}

export function analyzeRecipeSeasonality(
  recipe: Recipe,
  targetMonth: number = getCurrentMonth()
): RecipeSeasonAnalysis {
  const inSeasonProduce: { id: string; name: string }[] = [];
  const outOfSeasonProduce: { id: string; name: string; bestMonths: string }[] = [];

  recipe.ingredients.forEach(ing => {
    const info = INGREDIENTS[ing.id];
    if (!info) return;

    // Check if item has seasonal constraint
    if (info.cat === 'Fruits & Légumes' && info.season && info.season.length < 12) {
      if (info.season.includes(targetMonth)) {
        inSeasonProduce.push({ id: info.id, name: info.name });
      } else {
        outOfSeasonProduce.push({
          id: info.id,
          name: info.name,
          bestMonths: formatMonthRange(info.season)
        });
      }
    }
  });

  const produceCount = inSeasonProduce.length + outOfSeasonProduce.length;
  const isAllInSeason = outOfSeasonProduce.length === 0;
  const hasSeasonalProduce = produceCount > 0;

  let badgeType: 'in-season' | 'out-of-season' | 'year-round' = 'year-round';
  let summaryLabel = "Toute l'année";

  if (outOfSeasonProduce.length > 0) {
    badgeType = 'out-of-season';
    summaryLabel = `${outOfSeasonProduce.length} ingrédient${outOfSeasonProduce.length > 1 ? 's' : ''} hors saison`;
  } else if (inSeasonProduce.length > 0) {
    badgeType = 'in-season';
    summaryLabel = 'De saison 🌱';
  }

  return {
    isAllInSeason,
    hasSeasonalProduce,
    produceCount,
    inSeasonProduce,
    outOfSeasonProduce,
    badgeType,
    summaryLabel
  };
}

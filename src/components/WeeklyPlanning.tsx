import React, { useState } from 'react';
import { DayMealPlan, MealType, Recipe, StudentProfile } from '../types';
import { calculateDishEstimatedCost } from '../utils/budget';
import { calculateDishNutrition, findRecipeById } from '../utils/nutrition';
import { getValidRecipes, pickRandomRecipe } from '../utils/planner';
import {
  analyzeRecipeSeasonality,
  getCurrentMonth,
  getSeasonForMonth,
  MONTH_NAMES_FR,
  SEASONS
} from '../utils/seasons';
import {
  ArrowLeftRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dices,
  Flame,
  Heart,
  Info,
  Leaf,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  UtensilsCrossed
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MealPickerModal } from './MealPickerModal';

interface WeeklyPlanningProps {
  plan: DayMealPlan[];
  completedMeals: Record<string, boolean>;
  profile: StudentProfile;
  storeProfileId: string;
  customRecipes?: Record<MealType, Recipe[]>;
  favoriteRecipeIds: string[];
  selectedSeasonMonth: number;
  onSelectSeasonMonth: (month: number) => void;
  onToggleFavorite: (recipeId: string) => void;
  onToggleMealDone: (dayIdx: number, type: MealType) => void;
  onSetMeal: (dayIdx: number, type: MealType, recipeId: string | null) => void;
  onSwapMeals: (d1: number, t1: MealType, d2: number, t2: MealType) => void;
  onInspectDish: (recipe: Recipe) => void;
  onCookDish: (recipe: Recipe, dayIdx: number, type: MealType) => void;
}

export const WeeklyPlanning: React.FC<WeeklyPlanningProps> = ({
  plan,
  completedMeals,
  profile,
  storeProfileId,
  customRecipes,
  favoriteRecipeIds,
  selectedSeasonMonth,
  onSelectSeasonMonth,
  onToggleFavorite,
  onToggleMealDone,
  onSetMeal,
  onSwapMeals,
  onInspectDish,
  onCookDish
}) => {
  const [swapSource, setSwapSource] = useState<{ dayIdx: number; type: MealType } | null>(null);
  const [pickerTarget, setPickerTarget] = useState<{ dayIdx: number; dayName: string; type: MealType } | null>(null);

  // Time & progress stats
  let totalMinutes = 0;
  let totalMealsCount = 0;
  let doneMealsCount = 0;
  let seasonalMealsCount = 0;

  plan.forEach((d, dIdx) => {
    (['midi', 'soir'] as MealType[]).forEach(type => {
      const rid = d[type];
      if (!rid) return;
      totalMealsCount++;
      if (completedMeals[`${dIdx}-${type}`]) doneMealsCount++;

      const recipe = findRecipeById(type, rid, customRecipes);
      if (recipe) {
        const match = recipe.time.match(/(\d+)\s*min/);
        if (match) totalMinutes += parseInt(match[1], 10);

        const seasonAnalysis = analyzeRecipeSeasonality(recipe, selectedSeasonMonth);
        if (seasonAnalysis.isAllInSeason) {
          seasonalMealsCount++;
        }
      }
    });
  });

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const progressPct = totalMealsCount > 0 ? Math.round((doneMealsCount / totalMealsCount) * 100) : 0;
  const activeSeason = getSeasonForMonth(selectedSeasonMonth);

  const handleSwapClick = (dayIdx: number, type: MealType) => {
    if (!swapSource) {
      setSwapSource({ dayIdx, type });
      return;
    }

    if (swapSource.dayIdx === dayIdx && swapSource.type === type) {
      setSwapSource(null);
      return;
    }

    onSwapMeals(swapSource.dayIdx, swapSource.type, dayIdx, type);
    setSwapSource(null);
  };

  const handleReroll = (dayIdx: number, type: MealType) => {
    const current = plan[dayIdx][type];
    const used = new Set(plan.map((d, idx) => idx !== dayIdx ? d[type] : null).filter(Boolean) as string[]);
    if (current) used.add(current);

    const pool = getValidRecipes(type, profile, customRecipes);
    const pick = pickRandomRecipe(pool, used, type, customRecipes);
    if (!pick) {
      alert("Aucune autre recette disponible avec votre équipement actuel.");
      return;
    }

    onSetMeal(dayIdx, type, pick.id);
  };

  const handleAddSlot = (dayIdx: number, type: MealType) => {
    const used = new Set(plan.map(d => d[type]).filter(Boolean) as string[]);
    const pool = getValidRecipes(type, profile, customRecipes);
    const pick = pickRandomRecipe(pool, used, type, customRecipes);
    if (pick) {
      onSetMeal(dayIdx, type, pick.id);
    }
  };

  const handleOpenPicker = (dayIdx: number, dayName: string, type: MealType) => {
    setPickerTarget({ dayIdx, dayName, type });
  };

  const handleToggleDoneWithConfetti = (dayIdx: number, type: MealType) => {
    const isAlreadyDone = !!completedMeals[`${dayIdx}-${type}`];
    onToggleMealDone(dayIdx, type);
    if (!isAlreadyDone) {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#f59e0b', '#6366f1']
        });
      } catch (e) {}
    }
  };

  const getNutriScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-[#527950] text-white';
      case 'B': return 'bg-[#7A9660] text-white';
      case 'C': return 'bg-[#D97706] text-white';
      case 'D': return 'bg-[#C87428] text-white';
      case 'E': return 'bg-[#B84A39] text-white';
      default: return 'bg-[#A39E93] text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Time in kitchen, Cooking Progress & Season Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cooking Time Box */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D7] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] text-[#D97706] flex items-center justify-center border border-[#F4DECA] shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#7D7569] font-medium block">Temps de cuisine estimé :</span>
            <div className="text-base sm:text-lg font-bold text-[#433E37] font-mono-code">
              {totalMinutes > 0 ? `${hours > 0 ? `${hours}h ` : ''}${mins} min` : '—'}
            </div>
            <span className="text-[10px] text-[#A39E93]">sur la semaine</span>
          </div>
        </div>

        {/* Progress Box */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D7] shadow-xs flex flex-col justify-center space-y-1.5">
          <div className="flex justify-between text-xs font-mono-code text-[#7D7569]">
            <span className="font-bold text-[#433E37]">Avancement semaine</span>
            <span className="font-bold text-[#3D593A]">{doneMealsCount} / {totalMealsCount} ({progressPct}%)</span>
          </div>
          <div className="h-2.5 w-full bg-[#F4F1EB] rounded-full overflow-hidden border border-[#E6E1D7]">
            <div
              className="h-full bg-[#8BA888] transition-all duration-500 rounded-full"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[10px] text-[#A39E93]">
            {totalMealsCount - doneMealsCount} repas restant{totalMealsCount - doneMealsCount > 1 ? 's' : ''} à préparer
          </span>
        </div>

        {/* Active Season Box */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D7] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EBF2EA] text-[#3D593A] flex items-center justify-center border border-[#D1E0CE] text-xl shrink-0">
              {activeSeason.emoji}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#7D7569] font-medium">Saison active :</span>
                <span className="text-xs font-bold text-[#3D593A]">{activeSeason.label}</span>
              </div>
              <div className="text-xs font-semibold text-[#433E37] flex items-center gap-1 mt-0.5">
                <Leaf className="w-3 h-3 text-[#8BA888]" />
                <span>{seasonalMealsCount}/{totalMealsCount} plats 100% de saison</span>
              </div>
            </div>
          </div>

          {/* Month Selector */}
          <div className="shrink-0">
            <select
              value={selectedSeasonMonth}
              onChange={(e) => onSelectSeasonMonth(parseInt(e.target.value, 10))}
              className="text-xs font-bold bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl py-2 px-2 text-[#433E37] focus:outline-none focus:border-[#8BA888] cursor-pointer"
              title="Changer le mois de référence pour la saisonnalité des fruits et légumes"
            >
              {MONTH_NAMES_FR.map((name, idx) => {
                const m = idx + 1;
                const s = getSeasonForMonth(m);
                return (
                  <option key={m} value={m}>
                    {s.emoji} {name}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Swap Active Alert notice */}
      {swapSource && (
        <div className="p-3.5 bg-[#FDF6EE] border-2 border-[#D97706] text-[#8A4A15] rounded-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 text-xs font-bold">
            <ArrowLeftRight className="w-4 h-4" />
            <span>
              Mode Échange actif : Clique sur un second repas ({swapSource.type === 'midi' ? 'déjeuner' : 'dîner'}) pour intervertir !
            </span>
          </div>
          <button
            onClick={() => setSwapSource(null)}
            className="text-xs underline font-bold px-2 py-1 hover:bg-[#F4DECA] rounded cursor-pointer"
          >
            Annuler
          </button>
        </div>
      )}

      {/* 7 Days Grid */}
      <div className="space-y-4">
        {plan.map((dayPlan, dayIdx) => (
          <div
            key={dayPlan.day}
            className="bg-white rounded-2xl border border-[#E6E1D7] shadow-xs overflow-hidden transition-shadow hover:shadow-md"
          >
            {/* Day Header */}
            <div className="bg-[#433E37] text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono-code font-bold text-[#8BA888] px-1.5 py-0.5 rounded bg-[#322E28]">
                  {String(dayIdx + 1).padStart(2, '0')}
                </span>
                <h3 className="font-bold text-base tracking-wide">
                  {dayPlan.day}
                </h3>
              </div>

              {dayPlan.weekend && (
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#C87428] text-white">
                  Week-end
                </span>
              )}
            </div>

            {/* Meals in Day (Midi & Soir) */}
            <div className="divide-y divide-[#F4F1EB]">
              {(['midi', 'soir'] as MealType[]).map(type => {
                const rid = dayPlan[type];
                const recipe = findRecipeById(type, rid, customRecipes);
                const isDone = !!completedMeals[`${dayIdx}-${type}`];
                const isSwapTarget = swapSource?.dayIdx === dayIdx && swapSource?.type === type;
                const isFav = recipe ? favoriteRecipeIds.includes(recipe.id) : false;

                if (!recipe || !rid) {
                  return (
                    <div key={type} className="p-3.5 px-4 sm:px-5 flex items-center justify-between bg-[#F9F7F2]">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          type === 'midi' ? 'bg-[#EBF2EA] text-[#3D593A] border-[#D1E0CE]' : 'bg-[#F4F1EB] text-[#433E37] border-[#E6E1D7]'
                        }`}>
                          {type === 'midi' ? 'Midi' : 'Soir'}
                        </span>
                        <span className="text-xs text-[#A39E93] italic">Aucun repas planifié</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Search and Pick Specific Dish */}
                        <button
                          onClick={() => handleOpenPicker(dayIdx, dayPlan.day, type)}
                          className="px-3 py-1.5 text-xs font-bold text-[#433E37] bg-white hover:bg-[#F4F1EB] rounded-lg flex items-center gap-1.5 border border-[#DCD6CB] cursor-pointer shadow-2xs transition-colors"
                        >
                          <Search className="w-3.5 h-3.5 text-[#8BA888]" />
                          <span>Choisir un plat</span>
                        </button>

                        {/* Quick Random Add */}
                        <button
                          onClick={() => handleAddSlot(dayIdx, type)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-[#7D7569] hover:text-[#433E37] bg-[#EAE5DC] hover:bg-[#DCD6CB] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                          title="Ajouter un plat au hasard"
                        >
                          <Dices className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Aléatoire</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                const nutrition = calculateDishNutrition(recipe);
                const cost = calculateDishEstimatedCost(recipe, storeProfileId);
                const seasonAnalysis = analyzeRecipeSeasonality(recipe, selectedSeasonMonth);

                return (
                  <div
                    key={type}
                    className={`p-3.5 px-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 transition-colors ${
                      isDone
                        ? 'bg-[#F9F7F2]/80 text-[#A39E93]'
                        : isSwapTarget
                        ? 'bg-[#FDF6EE] ring-2 ring-[#D97706] ring-inset'
                        : 'hover:bg-[#F9F7F2]'
                    }`}
                  >
                    {/* Left: Tag + Heart + Name + Prep time */}
                    <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${
                        type === 'midi' ? 'bg-[#EBF2EA] text-[#3D593A] border-[#D1E0CE]' : 'bg-[#F4F1EB] text-[#433E37] border-[#E6E1D7]'
                      }`}>
                        {type === 'midi' ? 'Midi' : 'Soir'}
                      </span>

                      {/* Favorite Heart Button */}
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(recipe.id)}
                        className="p-1 text-[#A39E93] hover:text-[#B84A39] transition-colors rounded-md cursor-pointer shrink-0"
                        title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform active:scale-125 ${
                            isFav ? 'text-[#B84A39] fill-[#B84A39]' : 'hover:fill-[#B84A39]/20'
                          }`}
                        />
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => onInspectDish(recipe)}
                            className={`font-semibold text-xs sm:text-sm hover:text-[#8BA888] cursor-pointer transition-colors ${
                              isDone ? 'line-through text-[#A39E93]' : 'text-[#433E37]'
                            }`}
                          >
                            {recipe.name}
                          </span>

                          {/* Seasonal Badge */}
                          {seasonAnalysis.hasSeasonalProduce && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 ${
                                seasonAnalysis.isAllInSeason
                                  ? 'bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE]'
                                  : 'bg-[#FDF6EE] text-[#D97706] border border-[#F4DECA]'
                              }`}
                              title={
                                seasonAnalysis.isAllInSeason
                                  ? 'Tous les fruits et légumes de ce plat sont de saison'
                                  : seasonAnalysis.outOfSeasonProduce
                                      .map(p => `${p.name} (saison : ${p.bestMonths})`)
                                      .join(', ')
                              }
                            >
                              {seasonAnalysis.isAllInSeason ? '🌱 De saison' : '⚠️ Hors saison'}
                            </span>
                          )}

                          {recipe.isFallback && (
                            <span className="text-[10px] text-[#D97706] font-bold bg-[#FDF6EE] px-1.5 py-0.2 rounded border border-[#F4DECA]">
                              Dépannage
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-[#7D7569] mt-0.5 font-mono-code">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#A39E93]" />
                            {recipe.time}
                          </span>
                          <span>·</span>
                          <span className="text-[#3D593A] font-bold">
                            {cost.toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Nutrition Micro Badges */}
                    <div className="hidden md:flex items-center gap-2 shrink-0">
                      <span
                        onClick={() => onInspectDish(recipe)}
                        className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded cursor-pointer ${getNutriScoreColor(nutrition.nutriScore)}`}
                        title={`Nutri-Score ${nutrition.nutriScore}`}
                      >
                        {nutrition.nutriScore}
                      </span>

                      <div className="text-[10px] text-[#7D7569] font-mono-code flex gap-1.5 bg-[#F4F1EB] px-2 py-1 rounded-lg border border-[#E6E1D7]">
                        <span className="text-[#D97706] font-semibold">{nutrition.calories} kcal</span>
                        <span>·</span>
                        <span className="text-[#433E37] font-semibold">{nutrition.proteins}g prot</span>
                        <span>·</span>
                        <span className="text-[#3D593A] font-semibold">{nutrition.fiber}g fibres</span>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Mark Done Toggle */}
                      <button
                        onClick={() => handleToggleDoneWithConfetti(dayIdx, type)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isDone
                            ? 'bg-[#EAE5DC] text-[#7D7569] hover:bg-[#DCD6CB]'
                            : 'bg-[#8BA888] hover:bg-[#799976] text-white shadow-2xs'
                        }`}
                        title="Marquer comme cuisiné (déduit les ingrédients de votre frigo)"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isDone ? 'Cuisiné' : 'Cuisiner'}</span>
                      </button>

                      {!isDone && (
                        <>
                          {/* Search / Pick Specific Recipe */}
                          <button
                            onClick={() => handleOpenPicker(dayIdx, dayPlan.day, type)}
                            className="p-1.5 text-[#433E37] hover:text-[#2E2A25] bg-[#F4F1EB] hover:bg-[#EAE5DC] border border-[#E6E1D7] rounded-lg transition-colors cursor-pointer"
                            title="Rechercher et choisir un autre plat précis pour ce créneau"
                          >
                            <Search className="w-4 h-4 text-[#8BA888]" />
                          </button>

                          {/* Cooking mode with timers */}
                          <button
                            onClick={() => onCookDish(recipe, dayIdx, type)}
                            className="p-1.5 text-[#433E37] hover:text-[#2E2A25] bg-[#F4F1EB] hover:bg-[#EAE5DC] border border-[#E6E1D7] rounded-lg transition-colors cursor-pointer"
                            title="Mode cuisson pas-à-pas avec minuteurs"
                          >
                            <UtensilsCrossed className="w-4 h-4" />
                          </button>

                          {/* Inspect Dish */}
                          <button
                            onClick={() => onInspectDish(recipe)}
                            className="p-1.5 text-[#433E37] hover:text-[#2E2A25] bg-[#F4F1EB] hover:bg-[#EAE5DC] border border-[#E6E1D7] rounded-lg transition-colors cursor-pointer"
                            title="Fiche nutritionnelle détaillée"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          {/* Swap meal */}
                          <button
                            onClick={() => handleSwapClick(dayIdx, type)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isSwapTarget
                                ? 'bg-[#D97706] text-white font-bold'
                                : 'text-[#433E37] hover:text-[#2E2A25] bg-[#F4F1EB] hover:bg-[#EAE5DC] border border-[#E6E1D7]'
                            }`}
                            title="Intervertir avec un autre jour"
                          >
                            <ArrowLeftRight className="w-4 h-4" />
                          </button>

                          {/* Reroll single meal */}
                          <button
                            onClick={() => handleReroll(dayIdx, type)}
                            className="p-1.5 text-[#433E37] hover:text-[#2E2A25] bg-[#F4F1EB] hover:bg-[#EAE5DC] border border-[#E6E1D7] rounded-lg transition-colors cursor-pointer"
                            title="Changer de plat aléatoirement"
                          >
                            <Dices className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => onSetMeal(dayIdx, type, null)}
                            className="p-1.5 text-[#B84A39] hover:text-[#8C3426] hover:bg-[#FDF2F0] rounded-lg transition-colors cursor-pointer"
                            title="Retirer ce repas"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dish Picker Modal */}
      {pickerTarget && (
        <MealPickerModal
          isOpen={Boolean(pickerTarget)}
          targetSlot={pickerTarget}
          currentRecipeId={plan[pickerTarget.dayIdx]?.[pickerTarget.type] || null}
          profile={profile}
          customRecipes={customRecipes || { midi: [], soir: [] }}
          storeProfileId={storeProfileId}
          favoriteRecipeIds={favoriteRecipeIds}
          selectedSeasonMonth={selectedSeasonMonth}
          onToggleFavorite={onToggleFavorite}
          onSelectRecipe={(dIdx, type, rId) => onSetMeal(dIdx, type, rId)}
          onInspectRecipe={onInspectDish}
          onClose={() => setPickerTarget(null)}
        />
      )}
    </div>
  );
};

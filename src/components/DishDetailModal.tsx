import React from 'react';
import { INGREDIENTS } from '../data/ingredients';
import { Recipe } from '../types';
import { calculateDishEstimatedCost } from '../utils/budget';
import { calculateDishNutrition } from '../utils/nutrition';
import { Check, CheckCircle2, Clock, Flame, Info, ShoppingCart, Sparkles, UtensilsCrossed, X } from 'lucide-react';

interface DishDetailModalProps {
  recipe: Recipe | null;
  storeProfileId: string;
  isAddedToShopping?: boolean;
  onClose: () => void;
  onCook?: (recipe: Recipe) => void;
  onAddToShopping?: (recipe: Recipe) => void;
}

export const DishDetailModal: React.FC<DishDetailModalProps> = ({
  recipe,
  storeProfileId,
  isAddedToShopping = false,
  onClose,
  onCook,
  onAddToShopping
}) => {
  if (!recipe) return null;

  const nutrition = calculateDishNutrition(recipe);
  const cost = calculateDishEstimatedCost(recipe, storeProfileId);

  const getNutriScoreColor = (score: string) => {
    switch (score) {
      case 'A': return 'bg-[#8BA888] text-white';
      case 'B': return 'bg-[#9DB89A] text-white';
      case 'C': return 'bg-[#E2B37E] text-[#433E37]';
      case 'D': return 'bg-[#D97706] text-white';
      case 'E': return 'bg-[#B84A39] text-white';
      default: return 'bg-[#C2BBAF] text-white';
    }
  };

  // Macro percentages in kcal
  const protKcal = nutrition.proteins * 4;
  const carbKcal = nutrition.carbs * 4;
  const fatKcal = nutrition.fats * 9;
  const totalKcal = protKcal + carbKcal + fatKcal || 1;

  const protPct = Math.round((protKcal / totalKcal) * 100);
  const carbPct = Math.round((carbKcal / totalKcal) * 100);
  const fatPct = Math.round((fatKcal / totalKcal) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#433E37]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] bg-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F4F1EB] text-[#433E37] border border-[#E6E1D7]">
                {recipe.type === 'midi' ? '☀️ Midi' : '🌙 Soir'}
              </span>
              <span className="flex items-center gap-1 text-xs text-[#7D7569] font-mono-code">
                <Clock className="w-3.5 h-3.5" />
                {recipe.time}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#433E37] leading-tight">
              {recipe.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A39E93] hover:text-[#433E37] hover:bg-[#F4F1EB] rounded-lg transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded-xl border border-[#E6E1D7] text-center shadow-2xs">
              <span className="text-xs text-[#7D7569] block">Prix estimé</span>
              <span className="text-lg font-bold text-[#3D593A] font-mono-code">
                {cost.toFixed(2)} €
              </span>
              <span className="text-[10px] text-[#A39E93] block">par portion</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E6E1D7] text-center shadow-2xs">
              <span className="text-xs text-[#7D7569] block">Calories</span>
              <span className="text-lg font-bold text-[#D97706] font-mono-code flex items-center justify-center gap-0.5">
                <Flame className="w-4 h-4 text-[#D97706] inline" />
                {nutrition.calories}
              </span>
              <span className="text-[10px] text-[#A39E93] block">kcal</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E6E1D7] text-center shadow-2xs">
              <span className="text-xs text-[#7D7569] block">Protéines</span>
              <span className="text-lg font-bold text-[#3D593A] font-mono-code">
                {nutrition.proteins}g
              </span>
              <span className="text-[10px] text-[#A39E93] block">{protPct}% de l'énergie</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#E6E1D7] text-center flex flex-col items-center justify-center shadow-2xs">
              <span className="text-xs text-[#7D7569] block">Nutri-Score</span>
              <div className="flex items-center gap-1 mt-1">
                {(['A', 'B', 'C', 'D', 'E'] as const).map((grade) => (
                  <span
                    key={grade}
                    className={`text-xs font-black px-1.5 py-0.5 rounded transition-transform ${
                      nutrition.nutriScore === grade
                        ? `${getNutriScoreColor(grade)} scale-110 shadow-xs ring-2 ring-[#433E37]/20`
                        : 'bg-[#EAE5DC] text-[#A39E93] opacity-60'
                    }`}
                  >
                    {grade}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-[#A39E93] mt-1">Équilibre</span>
            </div>
          </div>

          {/* Macro Nutrient Breakdown Bar */}
          <div className="p-4 bg-white rounded-xl border border-[#E6E1D7] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#433E37] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
              Répartition des Macro-nutriments
            </h4>

            {/* Visual stacked bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-[#F4F1EB]">
              <div
                style={{ width: `${protPct}%` }}
                className="bg-[#8BA888] h-full transition-all"
                title={`Protéines: ${nutrition.proteins}g (${protPct}%)`}
              />
              <div
                style={{ width: `${carbPct}%` }}
                className="bg-[#D97706] h-full transition-all"
                title={`Glucides: ${nutrition.carbs}g (${carbPct}%)`}
              />
              <div
                style={{ width: `${fatPct}%` }}
                className="bg-[#C2BBAF] h-full transition-all"
                title={`Lipides: ${nutrition.fats}g (${fatPct}%)`}
              />
            </div>

            {/* Legend & Details */}
            <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
              <div className="p-1.5 rounded bg-[#EBF2EA] border border-[#D1E0CE]">
                <span className="text-[10px] text-[#3D593A] font-semibold block">Protéines</span>
                <span className="font-bold text-[#3D593A] font-mono-code">{nutrition.proteins}g</span>
                <span className="text-[10px] text-[#7D7569] block">({protPct}%)</span>
              </div>
              <div className="p-1.5 rounded bg-[#FDF6EE] border border-[#FAD7A0]">
                <span className="text-[10px] text-[#9A5304] font-semibold block">Glucides</span>
                <span className="font-bold text-[#9A5304] font-mono-code">{nutrition.carbs}g</span>
                <span className="text-[10px] text-[#7D7569] block">({carbPct}%)</span>
              </div>
              <div className="p-1.5 rounded bg-[#F4F1EB] border border-[#E6E1D7]">
                <span className="text-[10px] text-[#433E37] font-semibold block">Lipides</span>
                <span className="font-bold text-[#433E37] font-mono-code">{nutrition.fats}g</span>
                <span className="text-[10px] text-[#7D7569] block">({fatPct}%)</span>
              </div>
              <div className="p-1.5 rounded bg-[#EBF2EA] border border-[#D1E0CE]">
                <span className="text-[10px] text-[#3D593A] font-semibold block">Fibres</span>
                <span className="font-bold text-[#3D593A] font-mono-code">{nutrition.fiber}g</span>
                <span className="text-[10px] text-[#3D593A] block">Satiété</span>
              </div>
            </div>

            {/* Highlights Chips */}
            {nutrition.keyHighlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E6E1D7]">
                {nutrition.keyHighlights.map((hl, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 rounded-full bg-[#F4F1EB] text-[#433E37] border border-[#E6E1D7]"
                  >
                    {hl}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Ingredients list */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#433E37] mb-2 flex items-center justify-between">
              <span>Ingrédients nécessaires</span>
              <span className="text-[#A39E93] normal-case font-normal text-xs">{recipe.ingredients.length} ingrédients</span>
            </h4>
            <div className="bg-white rounded-xl border border-[#E6E1D7] divide-y divide-[#EAE5DC]">
              {recipe.ingredients.map((ingItem) => {
                const ing = INGREDIENTS[ingItem.id];
                if (!ing) return null;
                return (
                  <div key={ingItem.id} className="p-2.5 px-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8BA888]" />
                      <span className="font-medium text-[#433E37]">{ing.name}</span>
                      <span className="text-[#A39E93] text-[11px]">({ing.cat})</span>
                    </div>
                    <span className="font-mono-code font-semibold text-[#433E37] bg-[#F4F1EB] px-2 py-0.5 rounded border border-[#E6E1D7]">
                      {ingItem.qty} {ing.unit}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preparation steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#433E37] mb-2">
              Étapes de préparation
            </h4>
            <div className="space-y-2">
              {recipe.steps.map((step, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-[#E6E1D7] flex gap-3 text-xs leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#433E37] text-white font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="text-[#433E37] pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex flex-wrap items-center justify-between gap-3">
          <div>
            {onAddToShopping && (
              <button
                onClick={() => onAddToShopping(recipe)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isAddedToShopping
                    ? 'bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE]'
                    : 'bg-[#8BA888] hover:bg-[#789675] text-white shadow-2xs'
                }`}
              >
                {isAddedToShopping ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                <span>{isAddedToShopping ? 'Ingrédients ajoutés aux courses' : 'Ajouter ingrédients aux courses'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#433E37] hover:text-black bg-[#F4F1EB] hover:bg-[#EAE5DC] rounded-xl transition-colors cursor-pointer"
            >
              Fermer
            </button>
            {onCook && (
              <button
                onClick={() => {
                  onClose();
                  onCook(recipe);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#433E37] hover:bg-[#322E28] rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                Lancer le mode cuisson
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

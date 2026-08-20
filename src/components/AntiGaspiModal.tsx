import React from 'react';
import { INGREDIENTS } from '../data/ingredients';
import { DayMealPlan, MealType, Recipe, StudentProfile } from '../types';
import { findAntiGaspiRecipes } from '../utils/planner';
import { CheckCircle2, ChevronRight, Lightbulb, Plus, Sparkles, X } from 'lucide-react';

interface AntiGaspiModalProps {
  isOpen: boolean;
  fridge: Record<string, number>;
  profile: StudentProfile;
  storeProfileId: string;
  customRecipes?: Record<MealType, Recipe[]>;
  onClose: () => void;
  onSelectRecipeForPlan: (recipe: Recipe, type: MealType) => void;
}

export const AntiGaspiModal: React.FC<AntiGaspiModalProps> = ({
  isOpen,
  fridge,
  profile,
  storeProfileId,
  customRecipes,
  onClose,
  onSelectRecipeForPlan
}) => {
  if (!isOpen) return null;

  const matches = findAntiGaspiRecipes(fridge, profile, storeProfileId, customRecipes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#433E37]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] text-[#D97706] flex items-center justify-center border border-[#FAD7A0]">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#D97706]">
                Anti-Gaspillage & Économies
              </span>
              <h3 className="text-lg font-bold text-[#433E37] leading-tight">
                Que cuisiner avec mon frigo ?
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A39E93] hover:text-[#433E37] hover:bg-[#F4F1EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-[#7D7569] leading-relaxed">
            Voici les recettes réalisables avec les ingrédients déjà dans votre frigo, classées par coût résiduel :
          </p>

          {matches.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-[#E6E1D7] space-y-2">
              <p className="text-sm font-semibold text-[#433E37]">
                Aucun plat réalisable uniquement avec les restes actuels.
              </p>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                Ajoutez vos produits dans l'onglet "Frigo / Placard" pour débloquer des suggestions de repas à 0€ !
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((item, idx) => {
                const is100Percent = item.missingCost === 0;
                return (
                  <div
                    key={`${item.recipe.id}-${idx}`}
                    className="p-4 bg-white rounded-xl border border-[#E6E1D7] space-y-3 shadow-2xs hover:border-[#8BA888] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F4F1EB] text-[#433E37]">
                            {item.type}
                          </span>
                          <h4 className="text-sm font-bold text-[#433E37]">
                            {item.recipe.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-[#A39E93] font-mono-code block mt-0.5">
                          {item.recipe.time}
                        </span>
                      </div>

                      {is100Percent ? (
                        <span className="text-xs font-bold font-mono-code px-2.5 py-1 rounded-full bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE] shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          100% au Frigo (0 €)
                        </span>
                      ) : (
                        <span className="text-xs font-bold font-mono-code px-2.5 py-1 rounded-full bg-[#FDF6EE] text-[#9A5304] border border-[#FAD7A0] shrink-0">
                          +{item.missingCost.toFixed(2)} € de courses
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#7D7569] space-y-1 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E6E1D7]">
                      <div className="flex justify-between text-[11px]">
                        <span>Ingrédients possédés :</span>
                        <span className="font-bold text-[#3D593A]">
                          {item.inFridgeCount} / {item.totalCount}
                        </span>
                      </div>
                      {item.missingNames.length > 0 && (
                        <div className="text-[11px] text-[#9A5304]">
                          Manque seulement : <strong>{item.missingNames.join(', ')}</strong>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          onSelectRecipeForPlan(item.recipe, item.type);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 bg-[#433E37] hover:bg-[#322E28] text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter à mon planning
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#433E37] hover:text-black bg-[#F4F1EB] hover:bg-[#EAE5DC] rounded-xl cursor-pointer transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

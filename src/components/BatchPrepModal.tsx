import React from 'react';
import { DayMealPlan, MealType, Recipe, StudentProfile } from '../types';
import { computeBatchCookingPlan } from '../utils/planner';
import { Calendar, CheckCircle2, Clock, CookingPot, Flame, Sparkles, X } from 'lucide-react';

interface BatchPrepModalProps {
  isOpen: boolean;
  plan: DayMealPlan[];
  profile: StudentProfile;
  customRecipes?: Record<MealType, Recipe[]>;
  onClose: () => void;
}

export const BatchPrepModal: React.FC<BatchPrepModalProps> = ({
  isOpen,
  plan,
  profile,
  customRecipes,
  onClose
}) => {
  if (!isOpen) return null;

  const groups = computeBatchCookingPlan(plan, customRecipes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#433E37]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] text-[#D97706] flex items-center justify-center border border-[#FAD7A0]">
              <CookingPot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#D97706]">
                Organisation Étudiante & Gain de Temps
              </span>
              <h3 className="text-lg font-bold text-[#433E37] leading-tight">
                Plan de Préparation en Avance (Batch Cooking)
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
          <div className="p-3.5 bg-[#FDF6EE] rounded-xl border border-[#FAD7A0] text-xs text-[#9A5304] leading-relaxed flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
            <div>
              Fais tes courses le <strong>{profile.shoppingDay || 'Lundi'}</strong>, puis prends <strong>30 minutes</strong> pour cuire ces féculents et protéines en une seule fois. Tu gagneras plus de 2 heures pendant ta semaine de cours !
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-[#E6E1D7] text-[#A39E93] text-xs">
              Aucun ingrédient récurrent ne justifie de pré-cuisson en lot sur ce menu.
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map((group, idx) => (
                <div
                  key={`${group.id}-${idx}`}
                  className="p-4 bg-white rounded-xl border border-[#E6E1D7] space-y-2.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#433E37]">
                      {group.name}
                    </span>
                    <span className="text-xs font-mono-code font-bold text-[#3D593A] bg-[#EBF2EA] px-2.5 py-0.5 rounded-lg border border-[#D1E0CE]">
                      {group.totalQty} {group.unit} au total
                    </span>
                  </div>

                  <div className="text-xs text-[#7D7569] space-y-1">
                    <span className="text-[11px] text-[#A39E93] font-semibold block">
                      Sera consommé dans ces repas :
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {group.uses.map((u, uIdx) => (
                        <span
                          key={uIdx}
                          className="px-2 py-0.5 rounded-lg bg-[#F4F1EB] text-[#433E37] text-[11px] border border-[#E6E1D7]"
                        >
                          <strong>{u.day}</strong> ({u.type}) : {u.recipeName}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-[#3D593A] font-medium pt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3D593A]" />
                    💡 Fais bouillir la totalité d'un coup et conserve au frigo dans un tupperware hermétique (4 jours).
                  </div>
                </div>
              ))}
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

import React, { useState } from 'react';
import { INGREDIENTS } from '../data/ingredients';
import { MealType, Recipe, StudentProfile } from '../types';
import { analyzeTupperwareCompatibility, FridgeEmptyMatch, searchSmartFridgeRecipes } from '../utils/tupperware';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Filter,
  Flame,
  HelpCircle,
  Lightbulb,
  Plus,
  Refrigerator,
  Search,
  SlidersHorizontal,
  Sparkles,
  Utensils,
  X,
  Zap
} from 'lucide-react';

interface AntiGaspiModalProps {
  isOpen: boolean;
  fridge: Record<string, number>;
  profile: StudentProfile;
  storeProfileId: string;
  customRecipes?: Record<MealType, Recipe[]>;
  onClose: () => void;
  onSelectRecipeForPlan: (recipe: Recipe, type: MealType) => void;
  onGenerateFullEmptyFridgePlan?: () => void;
}

export const AntiGaspiModal: React.FC<AntiGaspiModalProps> = ({
  isOpen,
  fridge,
  profile,
  storeProfileId,
  customRecipes,
  onClose,
  onSelectRecipeForPlan,
  onGenerateFullEmptyFridgePlan
}) => {
  const [filterType, setFilterType] = useState<MealType | 'all'>('all');
  const [tupperwareOnly, setTupperwareOnly] = useState(false);
  const [quickOnly, setQuickOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'dishes' | 'tupperwareGuide'>('dishes');

  if (!isOpen) return null;

  const matches = searchSmartFridgeRecipes(fridge, profile, storeProfileId, customRecipes, {
    filterType,
    tupperwareOnly,
    quickOnly,
    minFridgeMatch: 1
  });

  const exactZeroMatches = matches.filter(m => m.missingCost === 0);
  const almostZeroMatches = matches.filter(m => m.missingCost > 0 && m.missingCost <= 2.0);
  const otherMatches = matches.filter(m => m.missingCost > 2.0);

  const fridgeTotalItems = Object.keys(fridge).filter(k => (fridge[k] || 0) > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#433E37]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] text-[#D97706] flex items-center justify-center border border-[#FAD7A0]">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#D97706]">
                  Anti-Gaspillage & Reste du Frigo
                </span>
                <span className="text-[10px] bg-[#EBF2EA] text-[#3D593A] font-bold px-2 py-0.2 rounded-full border border-[#D1E0CE]">
                  {fridgeTotalItems} ingrédient{fridgeTotalItems > 1 ? 's' : ''} en stock
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#433E37] leading-tight">
                Vider mon frigo intelligemment
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

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 px-5 pt-3 bg-white border-b border-[#E6E1D7]">
          <button
            onClick={() => setActiveTab('dishes')}
            className={`pb-2.5 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'dishes'
                ? 'border-[#8BA888] text-[#3D593A]'
                : 'border-transparent text-[#7D7569] hover:text-[#433E37]'
            }`}
          >
            <Refrigerator className="w-3.5 h-3.5" />
            <span>Recettes adaptées à mes restes ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tupperwareGuide')}
            className={`pb-2.5 px-2 text-xs font-bold border-b-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'tupperwareGuide'
                ? 'border-[#D97706] text-[#D97706]'
                : 'border-transparent text-[#7D7569] hover:text-[#433E37]'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Guide Tupperware & Lunchbox</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'tupperwareGuide' ? (
            <div className="space-y-4">
              <div className="bg-[#FDF6EE] p-4 rounded-xl border border-[#F4DECA] space-y-2">
                <h4 className="font-bold text-[#8A4A15] text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Règles d'or du Tupperware Étudiant (Midi)
                </h4>
                <p className="text-xs text-[#8A4A15] leading-relaxed">
                  Pour tes repas du midi en amphi, à la BU ou en stage, nos recettes du midi sont optimisées pour être faciles à transporter, réchauffables au micro-ondes ou dégustables froides !
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D7] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#3D593A] bg-[#EBF2EA] px-2 py-0.5 rounded border border-[#D1E0CE]">
                    ❄️ À manger froid (sans micro-ondes)
                  </span>
                  <p className="text-[11px] text-[#7D7569]">
                    Salades composées (pâtes, riz, lentilles), wraps roulés, sandwichs croustillants. Vinaigrette à part conseillée !
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D7] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#D97706] bg-[#FDF6EE] px-2 py-0.5 rounded border border-[#FAD7A0]">
                    🔥 Réchauffable express (1 à 2 min)
                  </span>
                  <p className="text-[11px] text-[#7D7569]">
                    Dahls de lentilles, riz sauté poulet/veggie, pâtes saucées. Ajoute 1 cuillère à soupe d’eau avant de réchauffer.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D7] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#433E37] bg-[#F4F1EB] px-2 py-0.5 rounded border border-[#E6E1D7]">
                    ⏳ Conservation frigo
                  </span>
                  <p className="text-[11px] text-[#7D7569]">
                    3 à 4 jours max pour les féculents cuits et plats mijotés. 2 jours pour les œufs cuits et salades déjà assaisonnées.
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-[#E6E1D7] space-y-1.5">
                  <span className="text-[11px] font-bold text-[#B84A39] bg-[#FDF2F0] px-2 py-0.5 rounded border border-[#FADCD9]">
                    ⚠️ Les pièges à éviter
                  </span>
                  <p className="text-[11px] text-[#7D7569]">
                    Évite le poisson réchauffé au micro-ondes en espace partagé. Préfère le thon froid en salade ou wrap.
                  </p>
                </div>
              </div>

              {onGenerateFullEmptyFridgePlan && (
                <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#DCD6CB] flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-bold text-[#433E37]">Générer la semaine avec midis en Tupperware</h5>
                    <p className="text-[11px] text-[#7D7569]">Remplit tous les midis avec des plats adaptés au transport et au batch cooking.</p>
                  </div>
                  <button
                    onClick={() => {
                      onGenerateFullEmptyFridgePlan();
                      onClose();
                    }}
                    className="px-3.5 py-2 bg-[#8BA888] hover:bg-[#799976] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Appliquer au planning</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Quick Filters */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-[#E6E1D7]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-[#7D7569] mr-1 flex items-center gap-1">
                    <Filter className="w-3 h-3" />
                    Créneau :
                  </span>

                  {(['all', 'midi', 'soir'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilterType(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        filterType === t
                          ? 'bg-[#433E37] text-white'
                          : 'bg-[#F4F1EB] text-[#7D7569] hover:bg-[#EAE5DC]'
                      }`}
                    >
                      {t === 'all' ? 'Tous' : t === 'midi' ? '☀️ Déjeuner (Midi)' : '🌙 Dîner (Soir)'}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTupperwareOnly(!tupperwareOnly)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border ${
                      tupperwareOnly
                        ? 'bg-[#EBF2EA] text-[#3D593A] border-[#D1E0CE]'
                        : 'bg-[#FAF8F5] text-[#7D7569] border-[#E6E1D7]'
                    }`}
                  >
                    <Briefcase className="w-3 h-3" />
                    <span>Tupperware midi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickOnly(!quickOnly)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border ${
                      quickOnly
                        ? 'bg-[#FDF6EE] text-[#D97706] border-[#FAD7A0]'
                        : 'bg-[#FAF8F5] text-[#7D7569] border-[#E6E1D7]'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>Moins de 15 min</span>
                  </button>
                </div>
              </div>

              {/* Action Banner: Generate whole plan from fridge */}
              {onGenerateFullEmptyFridgePlan && fridgeTotalItems > 0 && (
                <div className="bg-[#EBF2EA] p-3.5 rounded-xl border border-[#D1E0CE] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#3D593A] shrink-0" />
                    <span className="text-xs text-[#3D593A] font-semibold">
                      Envie de tout planifier en consommant tes restes en priorité ?
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      onGenerateFullEmptyFridgePlan();
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-[#3D593A] hover:bg-[#2C422A] text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-transform active:scale-95 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Générer un planning Vider Frigo</span>
                  </button>
                </div>
              )}

              {/* Matches List */}
              {matches.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-xl border border-dashed border-[#E6E1D7] space-y-2">
                  <Refrigerator className="w-8 h-8 text-[#A39E93] mx-auto" />
                  <p className="text-sm font-semibold text-[#433E37]">
                    Aucune recette trouvée avec les filtres sélectionnés.
                  </p>
                  <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                    Déclare plus d’ingrédients dans l'onglet "Courses & Frigo" ou élargis les critères de filtrage.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((item, idx) => {
                    const is100Percent = item.missingCost === 0;
                    const tup = analyzeTupperwareCompatibility(item.recipe);

                    return (
                      <div
                        key={`${item.recipe.id}-${idx}`}
                        className="p-4 bg-white rounded-xl border border-[#E6E1D7] space-y-3 shadow-2xs hover:border-[#8BA888] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                item.type === 'midi' ? 'bg-[#EBF2EA] text-[#3D593A] border-[#D1E0CE]' : 'bg-[#F4F1EB] text-[#433E37] border-[#E6E1D7]'
                              }`}>
                                {item.type === 'midi' ? 'Midi' : 'Soir'}
                              </span>

                              <h4 className="text-sm font-bold text-[#433E37]">
                                {item.recipe.name}
                              </h4>

                              {tup.isTupperwareFriendly && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE] flex items-center gap-1">
                                  <Briefcase className="w-2.5 h-2.5" />
                                  {tup.canEatCold ? 'Tupperware Froid' : 'Tupperware Micro-ondes'}
                                </span>
                              )}
                            </div>

                            <span className="text-[11px] text-[#A39E93] font-mono-code block mt-0.5">
                              ⏱️ {item.recipe.time}
                            </span>
                          </div>

                          {is100Percent ? (
                            <span className="text-xs font-bold font-mono-code px-2.5 py-1 rounded-full bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE] shrink-0 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              100% au Frigo (0 €)
                            </span>
                          ) : (
                            <span className="text-xs font-bold font-mono-code px-2.5 py-1 rounded-full bg-[#FDF6EE] text-[#9A5304] border border-[#FAD7A0] shrink-0">
                              +{item.missingCost.toFixed(2)} € à compléter
                            </span>
                          )}
                        </div>

                        {/* Ingredients breakdown */}
                        <div className="text-xs text-[#7D7569] space-y-1.5 bg-[#FAF8F5] p-3 rounded-xl border border-[#E6E1D7]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-[#433E37]">
                              Ingrédients dans ton frigo ({item.inFridgeIngredients.length}) :
                            </span>
                            <span className="font-bold text-[#3D593A]">
                              {item.fridgeCoveragePct}% couvert
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {item.inFridgeIngredients.map(ing => (
                              <span
                                key={ing.id}
                                className="text-[10px] bg-[#EBF2EA] text-[#3D593A] px-2 py-0.5 rounded font-mono-code border border-[#D1E0CE]"
                              >
                                ✓ {ing.name} ({ing.qtyInRecipe} {ing.unit})
                              </span>
                            ))}
                          </div>

                          {item.missingIngredients.length > 0 && (
                            <div className="pt-1 border-t border-[#E6E1D7]/60">
                              <span className="text-[10px] text-[#9A5304] font-semibold block mb-0.5">
                                À acheter en magasin ({item.missingIngredients.length}) :
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {item.missingIngredients.map(ing => (
                                  <span
                                    key={ing.id}
                                    className="text-[10px] bg-[#FDF6EE] text-[#9A5304] px-1.5 py-0.5 rounded font-mono-code border border-[#FAD7A0]"
                                  >
                                    + {ing.name} ({ing.cost.toFixed(2)} €)
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {tup.transportAdvice && item.type === 'midi' && (
                            <div className="text-[10px] text-[#7D7569] italic pt-1">
                              💡 Astuce transport : {tup.transportAdvice}
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
                            <span>Ajouter au planning</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex justify-between items-center">
          <span className="text-[11px] text-[#A39E93]">
            {matches.length} plat{matches.length > 1 ? 's' : ''} disponible{matches.length > 1 ? 's' : ''}
          </span>
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

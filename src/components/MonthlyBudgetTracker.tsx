import React, { useState } from 'react';
import { MonthlyBudgetStats, StoreProfile } from '../types';
import { STORE_PROFILES } from '../data/ingredients';
import { ArrowDownRight, ArrowUpRight, Calculator, CheckCircle2, ChevronRight, DollarSign, Lightbulb, PiggyBank, Receipt, ShieldAlert, Sparkles, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

interface MonthlyBudgetTrackerProps {
  stats: MonthlyBudgetStats;
  currentStoreId: string;
  onUpdateTargetBudget: (newTarget: number) => void;
  onSelectStore: (storeId: string) => void;
}

export const MonthlyBudgetTracker: React.FC<MonthlyBudgetTrackerProps> = ({
  stats,
  currentStoreId,
  onUpdateTargetBudget,
  onSelectStore
}) => {
  const [customBudgetInput, setCustomBudgetInput] = useState(stats.targetBudget.toString());
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [activeSimulation, setActiveSimulation] = useState<{
    veggieCount: number;
    useDiscountStore: boolean;
    useBulkStaples: boolean;
  }>({
    veggieCount: 2,
    useDiscountStore: currentStoreId === 'discount',
    useBulkStaples: true
  });

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(customBudgetInput);
    if (!isNaN(val) && val > 20 && val < 2000) {
      onUpdateTargetBudget(val);
      setIsEditingBudget(false);
    }
  };

  // Calcul du simulateur d'économies mensuelles
  const simulatedVeggieSaving = activeSimulation.veggieCount * 3.5 * 4.33; // 3.50€ d'économie par plat végétal
  const simulatedStoreSaving = (currentStoreId === 'citadin' ? 32 : currentStoreId === 'classique' ? 14 : 0);
  const simulatedBulkSaving = activeSimulation.useBulkStaples ? 12 : 0;
  const totalSimulatedSavings = Math.round(simulatedVeggieSaving + (activeSimulation.useDiscountStore ? simulatedStoreSaving : 0) + simulatedBulkSaving);

  const getStatusBadge = () => {
    switch (stats.status) {
      case 'optimal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Budget maîtrisé ({stats.percentUsed}%)
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDF6EE] text-[#9A5304] border border-[#FAD7A0]">
            <AlertCircleIcon className="w-3.5 h-3.5" />
            Attention ({stats.percentUsed}%)
          </span>
        );
      case 'danger':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDF2F0] text-[#8C3426] border border-[#F5C2BC]">
            <ShieldAlert className="w-3.5 h-3.5" />
            Dépassement ({stats.percentUsed}%)
          </span>
        );
    }
  };

  const hasActual = stats.actualPaidAmount !== null && stats.actualPaidAmount !== undefined;

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-[#433E37] text-[#FAF8F5] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#36312B] relative overflow-hidden">
        {/* Background graphic glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8BA888]/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-[#8BA888]/20 text-[#8BA888] border border-[#8BA888]/30">
                  <PiggyBank className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#8BA888]">
                  Compteur & Optimiseur de Budget Mensuel
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Gestion des Dépenses Alimentaires
              </h2>
              <p className="text-[#C2BBAF] text-xs sm:text-sm mt-1 max-w-xl">
                Suis en direct le coût estimé ou réel de tes semaines et applique les leviers d'économies pour ne jamais être à découvert.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {getStatusBadge()}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Target Budget */}
            <div className="bg-[#36312B] p-4 rounded-xl border border-[#4F4941]">
              <div className="flex items-center justify-between text-xs text-[#A39E93] mb-1">
                <span>Budget Cible / Mois</span>
                <button
                  onClick={() => setIsEditingBudget(!isEditingBudget)}
                  className="text-[#8BA888] hover:text-white font-semibold underline text-[11px] cursor-pointer"
                >
                  {isEditingBudget ? 'Annuler' : 'Modifier'}
                </button>
              </div>
              {isEditingBudget ? (
                <form onSubmit={handleSaveBudget} className="flex gap-1.5 mt-1">
                  <input
                    type="number"
                    value={customBudgetInput}
                    onChange={(e) => setCustomBudgetInput(e.target.value)}
                    className="w-20 bg-[#2B2722] border border-[#4F4941] rounded px-2 py-1 text-sm font-mono-code font-bold text-white focus:outline-none focus:border-[#8BA888]"
                    min="30"
                    max="1000"
                    step="5"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-[#8BA888] text-white font-bold text-xs rounded hover:bg-[#799976] cursor-pointer"
                  >
                    OK
                  </button>
                </form>
              ) : (
                <div className="text-2xl font-bold font-mono-code text-white">
                  {stats.targetBudget} <span className="text-sm font-normal text-[#A39E93]">€ / mois</span>
                </div>
              )}
              <span className="text-[11px] text-[#A39E93] block mt-1">
                ≈ {(stats.targetBudget / 4.33).toFixed(2)} € / semaine
              </span>
            </div>

            {/* Current Week Cost */}
            <div className="bg-[#36312B] p-4 rounded-xl border border-[#4F4941]">
              <div className="flex items-center justify-between text-xs text-[#A39E93] mb-1">
                <span>{hasActual ? 'Payé Réel (Semaine)' : 'Coût Estimé (Semaine)'}</span>
                {hasActual && (
                  <span className="text-[10px] bg-[#8BA888]/20 text-[#8BA888] px-1.5 py-0.2 rounded font-bold">
                    Ticket réel
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold font-mono-code text-[#E8A34D]">
                {hasActual ? stats.actualPaidAmount?.toFixed(2) : stats.weeklyEstimatedCost.toFixed(2)}{' '}
                <span className="text-sm font-normal text-[#A39E93]">€</span>
              </div>
              <span className="text-[11px] text-[#A39E93] block mt-1">
                {hasActual
                  ? `(Estimation initiale : ${stats.weeklyEstimatedCost.toFixed(2)} €)`
                  : 'Pour 14 repas (midi & soir)'}
              </span>
            </div>

            {/* Projected Month Cost */}
            <div className="bg-[#36312B] p-4 rounded-xl border border-[#4F4941]">
              <span className="text-xs text-[#A39E93] block mb-1">Projection Mensuelle</span>
              <div className="text-2xl font-bold font-mono-code text-white">
                {(stats.projectedActualMonthlyCost || stats.projectedMonthlyCost).toFixed(2)}{' '}
                <span className="text-sm font-normal text-[#A39E93]">€</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] mt-1 font-mono-code">
                {stats.remainingBudget >= 0 ? (
                  <span className="text-[#8BA888] flex items-center">
                    <ArrowDownRight className="w-3 h-3 inline" />
                    +{stats.remainingBudget.toFixed(2)} € de marge
                  </span>
                ) : (
                  <span className="text-[#E07A6D] flex items-center">
                    <ArrowUpRight className="w-3 h-3 inline" />
                    {Math.abs(stats.remainingBudget).toFixed(2)} € de dépassement
                  </span>
                )}
              </div>
            </div>

            {/* Cost Per Meal */}
            <div className="bg-[#36312B] p-4 rounded-xl border border-[#4F4941]">
              <span className="text-xs text-[#A39E93] block mb-1">Coût Moyen par Repas</span>
              <div className="text-2xl font-bold font-mono-code text-[#8BA888]">
                {stats.costPerMeal.toFixed(2)} <span className="text-sm font-normal text-[#A39E93]">€</span>
              </div>
              <span className="text-[11px] text-[#A39E93] block mt-1">
                ≈ {stats.costPerDay.toFixed(2)} € / jour (midi + soir)
              </span>
            </div>
          </div>

          {/* Budget Consumption Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono-code text-[#C2BBAF]">
              <span>Utilisation du budget mensuel : {stats.percentUsed}%</span>
              <span>
                {(stats.projectedActualMonthlyCost || stats.projectedMonthlyCost).toFixed(2)} € / {stats.targetBudget} €
              </span>
            </div>
            <div className="h-3 w-full bg-[#2B2722] rounded-full overflow-hidden border border-[#4F4941]">
              <div
                className={`h-full transition-all duration-500 ${
                  stats.status === 'optimal'
                    ? 'bg-[#8BA888]'
                    : stats.status === 'warning'
                    ? 'bg-[#D97706]'
                    : 'bg-[#B84A39]'
                }`}
                style={{ width: `${Math.min(100, stats.percentUsed)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2 Column Layout: Store Comparator & Interactive Savings Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Store Profile Chooser */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#433E37] text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#D97706]" />
              Impact du Choix du Magasin
            </h3>
            <span className="text-xs text-[#7D7569]">Coefficient prix</span>
          </div>

          <p className="text-xs text-[#7D7569] leading-relaxed">
            Pour un panier identique de 14 repas, le lieu où tu fais tes courses peut faire varier ta note mensuelle de <strong>30 à 45€</strong>.
          </p>

          <div className="space-y-2">
            {Object.values(STORE_PROFILES).map((store) => {
              const isSelected = currentStoreId === store.id;
              const storeMonthly = (stats.weeklyEstimatedCost / (STORE_PROFILES[currentStoreId]?.mult || 1.0)) * store.mult * 4.33;
              return (
                <div
                  key={store.id}
                  onClick={() => onSelectStore(store.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#EBF2EA] border-[#8BA888] ring-2 ring-[#8BA888]/20 shadow-xs'
                      : 'bg-[#F4F1EB] border-[#E6E1D7] hover:bg-[#EAE5DC]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#433E37]">{store.name}</span>
                      </div>
                      <p className="text-[11px] text-[#7D7569] mt-0.5">{store.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono-code font-bold text-[#433E37] block">
                        ≈ {storeMonthly.toFixed(0)} €/mois
                      </span>
                      <span className="text-[10px] text-[#A39E93] font-mono-code">
                        {store.badge}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Interactive Savings Simulator */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#433E37] text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#8BA888]" />
              Simulateur d'Économies Étudiantes
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EBF2EA] text-[#3D593A] font-bold font-mono-code border border-[#D1E0CE]">
              Jusqu'à +{totalSimulatedSavings} € / mois d'économies
            </span>
          </div>

          <p className="text-xs text-[#7D7569] leading-relaxed">
            Active ces leviers concrets dans ta routine alimentaire pour optimiser ton budget sans jamais rogner sur la santé :
          </p>

          <div className="space-y-3">
            {/* Lever 1: Veggie Protein Swap */}
            <div className="p-3.5 bg-[#F4F1EB] rounded-xl border border-[#E6E1D7] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#433E37] block">
                  🌱 Remplacer {activeSimulation.veggieCount} repas carnés par des légumineuses (lentilles, pois chiches, œufs)
                </span>
                <span className="text-[11px] text-[#7D7569] block">
                  Mêmes apports protéiques pour 3x moins cher
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={activeSimulation.veggieCount}
                  onChange={(e) => setActiveSimulation(prev => ({ ...prev, veggieCount: Number(e.target.value) }))}
                  className="text-xs font-bold bg-white border border-[#E6E1D7] rounded-lg px-2 py-1 text-[#433E37] cursor-pointer"
                >
                  <option value={1}>1 repas/sem</option>
                  <option value={2}>2 repas/sem</option>
                  <option value={3}>3 repas/sem</option>
                  <option value={4}>4 repas/sem</option>
                </select>
                <span className="text-xs font-mono-code font-bold text-[#3D593A] bg-[#EBF2EA] px-2 py-1 rounded border border-[#D1E0CE]">
                  +{Math.round(simulatedVeggieSaving)} €/m
                </span>
              </div>
            </div>

            {/* Lever 2: Bulk Staples */}
            <div className="p-3.5 bg-[#F4F1EB] rounded-xl border border-[#E6E1D7] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#433E37] block">
                  📦 Formats Vrac / 1kg sur le riz, pâtes et légumineuses
                </span>
                <span className="text-[11px] text-[#7D7569] block">
                  Économie automatique activée dans notre algorithme de ticket de caisse
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={activeSimulation.useBulkStaples}
                  onChange={(e) => setActiveSimulation(prev => ({ ...prev, useBulkStaples: e.target.checked }))}
                  className="rounded text-[#8BA888] focus:ring-0 w-4 h-4 cursor-pointer accent-[#8BA888]"
                />
                <span className="text-xs font-mono-code font-bold text-[#3D593A] bg-[#EBF2EA] px-2 py-1 rounded border border-[#D1E0CE]">
                  +12 €/m
                </span>
              </label>
            </div>

            {/* Lever 3: Store Switch */}
            <div className="p-3.5 bg-[#F4F1EB] rounded-xl border border-[#E6E1D7] flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#433E37] block">
                  🛒 Faire le gros des courses en Hard Discount (Lidl / Aldi)
                </span>
                <span className="text-[11px] text-[#7D7569] block">
                  15% moins cher sur les produits basiques de la liste
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={activeSimulation.useDiscountStore}
                  onChange={(e) => {
                    setActiveSimulation(prev => ({ ...prev, useDiscountStore: e.target.checked }));
                    if (e.target.checked) onSelectStore('discount');
                    else onSelectStore('standard');
                  }}
                  className="rounded text-[#8BA888] focus:ring-0 w-4 h-4 cursor-pointer accent-[#8BA888]"
                />
                <span className="text-xs font-mono-code font-bold text-[#3D593A] bg-[#EBF2EA] px-2 py-1 rounded border border-[#D1E0CE]">
                  +{simulatedStoreSaving || 18} €/m
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Student Money-Saving Rules / Checklist */}
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-[#433E37] text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D97706]" />
          Les 4 Règles d'Or pour Réduire les Dépenses Alimentaires
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.optimizationTips.map((tip, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-[#E6E1D7] space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FDF6EE] text-[#9A5304] border border-[#FAD7A0]">
                  {tip.tag}
                </span>
                <span className="text-xs font-mono-code font-bold text-[#3D593A]">
                  {tip.saving}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#433E37] leading-tight">
                {tip.title}
              </h4>
              <p className="text-[11px] text-[#7D7569] leading-relaxed">
                {tip.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

import React from 'react';
import { MonthlyBudgetStats, StudentProfile, WeeklyNutritionStats } from '../types';
import {
  BookOpen,
  Calendar,
  ChefHat,
  Cloud,
  CloudCheck,
  CookingPot,
  Dices,
  DollarSign,
  HeartPulse,
  Lightbulb,
  Plus,
  Refrigerator,
  Settings,
  ShoppingCart,
  Smartphone,
  Sparkles,
  TrendingDown,
  User,
  UtensilsCrossed,
  Wallet
} from 'lucide-react';

interface HeaderProps {
  profile: StudentProfile;
  activeTab: 'planning' | 'recipes' | 'shopping' | 'budget' | 'nutrition' | 'tools';
  budgetStats: MonthlyBudgetStats;
  nutritionStats: WeeklyNutritionStats;
  recipesCount?: number;
  isCloudSynced?: boolean;
  userEmail?: string | null;
  onOpenAuthModal?: () => void;
  onSelectTab: (tab: 'planning' | 'recipes' | 'shopping' | 'budget' | 'nutrition' | 'tools') => void;
  onOpenSettings: () => void;
  onGenerateRandom: () => void;
  onGenerateEco: () => void;
  onOpenNewRecipe: () => void;
  onOpenBatchCooking: () => void;
  onOpenAntiGaspi: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  budgetStats,
  nutritionStats,
  recipesCount = 28,
  isCloudSynced = false,
  userEmail = null,
  onOpenAuthModal,
  onSelectTab,
  onOpenSettings,
  onGenerateRandom,
  onGenerateEco,
  onOpenNewRecipe,
  onOpenBatchCooking,
  onOpenAntiGaspi
}) => {
  return (
    <header className="border-b border-[#E6E1D7] bg-white sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 space-y-3">
        {/* Top bar: Title + Equipment badge + Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#433E37] text-white flex items-center justify-center font-bold text-lg shadow-xs">
              🍳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FDF6EE] text-[#D97706] border border-[#F4DECA]">
                  {profile.name.toUpperCase()}
                </span>
                <h1 className="text-base sm:text-lg font-black text-[#433E37] tracking-tight">
                  Le Carnet Gourmand & Budget
                </h1>
                <button
                  onClick={onOpenSettings}
                  className="p-1 text-[#A39E93] hover:text-[#433E37] hover:bg-[#F4F1EB] rounded-lg transition-transform hover:rotate-45 cursor-pointer"
                  title="Modifier mon équipement de cuisine"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Equipment summary pill */}
              <div className="flex items-center gap-1.5 text-[11px] text-[#7D7569] font-mono-code mt-0.5">
                <span>🔥 {profile.plaques} pl.</span>
                <span>·</span>
                <span>🍳 {profile.poeles} poê.</span>
                <span>·</span>
                <span>🥘 {profile.casseroles} cass.</span>
                {profile.four && (
                  <>
                    <span>·</span>
                    <span>Four</span>
                  </>
                )}
                {profile.micro && (
                  <>
                    <span>·</span>
                    <span>Micro-o.</span>
                  </>
                )}
                <span>·</span>
                <span className="text-[#8BA888] font-semibold">Courses le {profile.shoppingDay || 'Lundi'}</span>
              </div>
            </div>
          </div>

          {/* Quick Generator Actions + Cloud Synced status */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Supabase Cloud Sync button */}
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isCloudSynced
                    ? 'bg-[#EBF2EA] hover:bg-[#DDE9DB] text-[#3D593A] border border-[#D1E0CE] shadow-2xs'
                    : 'bg-[#FAF8F5] hover:bg-[#F4F1EB] text-[#7D7569] hover:text-[#433E37] border border-[#DCD6CB]'
                }`}
                title={isCloudSynced ? `Connecté (${userEmail || 'Cloud actif'}) - Synchronisation en direct` : 'Activer la synchronisation Cloud / Mobile'}
              >
                <Cloud className={`w-3.5 h-3.5 ${isCloudSynced ? 'text-[#3D593A]' : 'text-[#A39E93]'}`} />
                <span>
                  {isCloudSynced
                    ? userEmail ? `${userEmail.split('@')[0]}` : 'Cloud Synchro'
                    : 'Synchro Cloud'}
                </span>
                {isCloudSynced && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8BA888] animate-pulse" />
                )}
              </button>
            )}

            <button
              onClick={onGenerateEco}
              className="px-3 py-1.5 bg-[#8BA888] hover:bg-[#799976] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
              title="Générer la semaine la plus économique possible"
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Génération Éco+</span>
            </button>

            <button
              onClick={onGenerateRandom}
              className="px-3 py-1.5 bg-[#433E37] hover:bg-[#332F2A] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
              title="Générer une semaine aléatoire adaptée à la saison et à ton matériel"
            >
              <Dices className="w-3.5 h-3.5 text-[#8BA888]" />
              <span>Aléatoire</span>
            </button>

            <button
              onClick={onOpenNewRecipe}
              className="px-3 py-1.5 bg-[#F4F1EB] hover:bg-[#EAE5DC] text-[#433E37] font-bold text-xs rounded-xl flex items-center gap-1.5 border border-[#E6E1D7] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Créer recette</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-[#E6E1D7] pt-2.5">
          {[
            {
              id: 'planning',
              label: 'Planning Semaine',
              icon: <Calendar className="w-4 h-4" />,
              badge: '14 repas'
            },
            {
              id: 'recipes',
              label: 'Livre de Recettes',
              icon: <BookOpen className="w-4 h-4" />,
              badge: `${recipesCount}`
            },
            {
              id: 'shopping',
              label: 'Courses & Frigo',
              icon: <ShoppingCart className="w-4 h-4" />,
              badge: `${budgetStats.weeklyEstimatedCost.toFixed(0)}€`
            },
            {
              id: 'budget',
              label: 'Budget Mensuel',
              icon: <Wallet className="w-4 h-4" />,
              badge: `${budgetStats.percentUsed}%`
            },
            {
              id: 'nutrition',
              label: 'Équilibre Nutritionnel',
              icon: <HeartPulse className="w-4 h-4" />,
              badge: `${nutritionStats.overallScore}/100`
            },
            {
              id: 'tools',
              label: 'Anti-Gaspi & Batch',
              icon: <Sparkles className="w-4 h-4" />,
              badge: 'Astuces'
            }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all select-none cursor-pointer ${
                  isActive
                    ? 'bg-[#433E37] text-white shadow-xs'
                    : 'text-[#7D7569] hover:text-[#433E37] hover:bg-[#F4F1EB]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-mono-code px-1.5 py-0.2 rounded-md ${
                      isActive
                        ? 'bg-[#332F2A] text-[#8BA888]'
                        : 'bg-[#F4F1EB] text-[#7D7569]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

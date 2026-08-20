import React, { useState } from 'react';
import { DayMealPlan, MealType, Recipe, WeeklyNutritionStats } from '../types';
import { calculateDishNutrition, findRecipeById } from '../utils/nutrition';
import { Activity, Apple, Award, CheckCircle2, ChevronRight, Eye, Flame, HeartPulse, Info, Layers, Salad, ShieldAlert, Sparkles, TrendingUp, Zap } from 'lucide-react';

interface NutritionDashboardProps {
  stats: WeeklyNutritionStats;
  weekPlan: DayMealPlan[];
  customRecipes?: Record<MealType, Recipe[]>;
  onInspectDish: (recipe: Recipe) => void;
}

export const NutritionDashboard: React.FC<NutritionDashboardProps> = ({
  stats,
  weekPlan,
  customRecipes,
  onInspectDish
}) => {
  const [filterTag, setFilterTag] = useState<string>('all');

  // Collect all unique meals in the week
  const weekMeals: { recipe: Recipe; day: string; type: MealType }[] = [];
  weekPlan.forEach(d => {
    (['midi', 'soir'] as MealType[]).forEach(type => {
      const rid = d[type];
      if (!rid) return;
      const recipe = findRecipeById(type, rid, customRecipes);
      if (recipe) {
        weekMeals.push({ recipe, day: d.day, type });
      }
    });
  });

  const filteredMeals = weekMeals.filter(item => {
    if (filterTag === 'all') return true;
    if (filterTag === 'midi' || filterTag === 'soir') return item.type === filterTag;
    const nutrition = calculateDishNutrition(item.recipe);
    if (filterTag === 'nutriscore-a') return nutrition.nutriScore === 'A' || nutrition.nutriScore === 'B';
    if (filterTag === 'high-prot') return nutrition.proteins >= 18;
    if (filterTag === 'high-fiber') return nutrition.fiber >= 4;
    return true;
  });

  // Count nutriscores
  const scoreCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  weekMeals.forEach(item => {
    const nutrition = calculateDishNutrition(item.recipe);
    scoreCounts[nutrition.nutriScore] = (scoreCounts[nutrition.nutriScore] || 0) + 1;
  });

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

  return (
    <div className="space-y-6">
      {/* Top Banner Overview */}
      <div className="bg-[#433E37] text-[#FAF8F5] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#36312B] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8BA888]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1.5 rounded-lg bg-[#8BA888]/20 text-[#8BA888] border border-[#8BA888]/30">
                  <HeartPulse className="w-5 h-5" />
                </span>
                <span className="text-xs font-mono-code font-bold uppercase tracking-widest text-[#8BA888]">
                  Analyseur Nutritionnel Étudiant
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Équilibre & Énergie pour les Études
              </h2>
              <p className="text-[#C2BBAF] text-xs sm:text-sm mt-1 max-w-xl">
                Visualise les macro-nutriments, vitamines et fibres de ta semaine pour garder une concentration maximale sans coup de barre.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#36312B] border border-[#4F4941] px-4 py-2 rounded-xl text-center">
                <span className="text-[10px] text-[#8BA888] uppercase font-bold tracking-wider block">
                  Score Global de la Semaine
                </span>
                <span className="text-2xl font-extrabold font-mono-code text-white">
                  {stats.overallScore} <span className="text-xs text-[#A39E93] font-normal">/ 100</span>
                </span>
                <span className="text-[11px] font-bold text-[#8BA888] block">
                  {stats.grade}
                </span>
              </div>
            </div>
          </div>

          {/* Key Nutrition Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Avg Daily Calories */}
            <div className="bg-[#36312B] p-4 rounded-xl border border-[#4F4941]">
              <span className="text-xs text-[#A39E93] block mb-1">Moyenne Quotidienne</span>
              <div className="text-2xl font-bold font-mono-code text-white flex items-center gap-1">
                <Flame className="w-5 h-5 text-[#E8A34D]" />
                {stats.avgDailyCalories} <span className="text-xs font-normal text-[#A39E93]">kcal/jour</span>
              </div>
              <span className="text-[11px] text-[#A39E93] block mt-1">
                Repères : 1800 - 2200 kcal
              </span>
            </div>

            {/* Protein Intake */}
            <div className="bg-[#36312B] p-4 rounded-xl border border-[#4F4941]">
              <span className="text-xs text-[#A39E93] block mb-1">Protéines Quotidiennes</span>
              <div className="text-2xl font-bold font-mono-code text-white">
                {Math.round(stats.totalProteins / 7)} <span className="text-xs font-normal text-[#A39E93]">g / jour</span>
              </div>
              <span className="text-[11px] text-[#8BA888] block mt-1">
                {stats.macroPercentages.proteins}% des calories totales
              </span>
            </div>

            {/* Daily Fiber */}
            <div className="bg-[#36312B] p-4 rounded-xl border border-[#4F4941]">
              <span className="text-xs text-[#A39E93] block mb-1">Fibres & Digestion</span>
              <div className="text-2xl font-bold font-mono-code text-white">
                {Math.round(stats.totalFiber / 7)} <span className="text-xs font-normal text-[#A39E93]">g / jour</span>
              </div>
              <span className="text-[11px] text-[#A39E93] block mt-1">
                Objectif santé : 25g+ / jour
              </span>
            </div>

            {/* Fruit & Veg Portions */}
            <div className="bg-[#36312B] p-4 rounded-xl border border-[#4F4941]">
              <span className="text-xs text-[#A39E93] block mb-1">Fruits & Légumes</span>
              <div className="text-2xl font-bold font-mono-code text-[#8BA888] flex items-center gap-1">
                <Salad className="w-5 h-5 text-[#8BA888]" />
                {(stats.fruitVegServings / 7).toFixed(1)} <span className="text-xs font-normal text-[#A39E93]">portions/j</span>
              </div>
              <span className="text-[11px] text-[#A39E93] block mt-1">
                Vitamines et minéraux
              </span>
            </div>
          </div>

          {/* Macro Distribution Stacked Gauge vs Target */}
          <div className="bg-[#36312B] p-4 sm:p-5 rounded-xl border border-[#4F4941] space-y-3">
            <div className="flex flex-wrap items-center justify-between text-xs text-[#C2BBAF]">
              <span className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-white">
                <Activity className="w-4 h-4 text-[#8BA888]" />
                Répartition des Calories de la Semaine
              </span>
              <span className="text-[#A39E93] font-mono-code text-[11px]">
                Idéal Étudiant : 15-20% Prot · 50-55% Gluc · 30% Lip
              </span>
            </div>

            {/* Actual Visual Bar */}
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-[#2B2722]">
              <div
                style={{ width: `${stats.macroPercentages.proteins}%` }}
                className="bg-[#8BA888] h-full transition-all"
                title={`Protéines: ${stats.macroPercentages.proteins}%`}
              />
              <div
                style={{ width: `${stats.macroPercentages.carbs}%` }}
                className="bg-[#D97706] h-full transition-all"
                title={`Glucides: ${stats.macroPercentages.carbs}%`}
              />
              <div
                style={{ width: `${stats.macroPercentages.fats}%` }}
                className="bg-[#C2BBAF] h-full transition-all"
                title={`Lipides: ${stats.macroPercentages.fats}%`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-3 pt-1 text-center text-xs">
              <div className="p-2 rounded bg-[#2B2722] border border-[#8BA888]/40">
                <span className="text-[10px] text-[#8BA888] font-bold block">Protéines (Muscles & Cerveau)</span>
                <span className="font-bold text-white font-mono-code">{stats.macroPercentages.proteins}%</span>
                <span className="text-[10px] text-[#A39E93] block">({stats.totalProteins}g total)</span>
              </div>
              <div className="p-2 rounded bg-[#2B2722] border border-[#D97706]/40">
                <span className="text-[10px] text-[#E8A34D] font-bold block">Glucides (Énergie Continue)</span>
                <span className="font-bold text-white font-mono-code">{stats.macroPercentages.carbs}%</span>
                <span className="text-[10px] text-[#A39E93] block">({stats.totalCarbs}g total)</span>
              </div>
              <div className="p-2 rounded bg-[#2B2722] border border-[#C2BBAF]/40">
                <span className="text-[10px] text-[#C2BBAF] font-bold block">Lipides (Bons Acides Gras)</span>
                <span className="font-bold text-white font-mono-code">{stats.macroPercentages.fats}%</span>
                <span className="text-[10px] text-[#A39E93] block">({stats.totalFats}g total)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2 Column: NutriScore Distribution & Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Nutriscore weekly distribution */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-4">
          <h3 className="font-bold text-[#433E37] text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-[#D97706]" />
            Répartition Nutri-Score de la Semaine
          </h3>

          <p className="text-xs text-[#7D7569] leading-relaxed">
            Sur les {weekMeals.length} repas prévus cette semaine :
          </p>

          <div className="space-y-2.5">
            {(['A', 'B', 'C', 'D', 'E'] as const).map(grade => {
              const count = scoreCounts[grade] || 0;
              const pct = weekMeals.length > 0 ? Math.round((count / weekMeals.length) * 100) : 0;
              return (
                <div key={grade} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${getNutriScoreColor(grade)}`}>
                    {grade}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-[#433E37]">
                        {grade === 'A' ? 'Excellente qualité nutritionnelle' :
                         grade === 'B' ? 'Très bon équilibre' :
                         grade === 'C' ? 'Équilibré standard' :
                         grade === 'D' ? 'Plat plaisir modéré' : 'À consommer occasionnellement'}
                      </span>
                      <span className="font-mono-code text-[#7D7569] font-bold">{count} repas ({pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-[#F4F1EB] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getNutriScoreColor(grade)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Nutritionist Student Recommendations */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-4">
          <h3 className="font-bold text-[#433E37] text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#D97706]" />
            Conseils Diététiques pour Étudiant
          </h3>

          <div className="space-y-2.5">
            {stats.adviceList.map((adv, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                  adv.type === 'success'
                    ? 'bg-[#EBF2EA] border-[#D1E0CE] text-[#3D593A]'
                    : adv.type === 'warning'
                    ? 'bg-[#FDF6EE] border-[#FAD7A0] text-[#9A5304]'
                    : 'bg-[#F4F1EB] border-[#E6E1D7] text-[#433E37]'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {adv.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#3D593A]" />
                  ) : adv.type === 'warning' ? (
                    <Info className="w-4 h-4 text-[#D97706]" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-[#8BA888]" />
                  )}
                </div>
                <span>{adv.text}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-[#F4F1EB] rounded-xl border border-[#E6E1D7] text-xs text-[#7D7569] space-y-1">
            <span className="font-bold text-[#433E37] block flex items-center gap-1.5">
              <Apple className="w-3.5 h-3.5 text-[#B84A39]" />
              Astuce révision & examens :
            </span>
            <p>
              Les flocons d'avoine au petit-déjeuner et les légumineuses au dîner libèrent du glucose en continu pendant 4 à 5 heures, évitant le coup de barre de 14h en amphi.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Dish Explorer & Filter */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6E1D7] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-[#433E37] text-base">
              Fiches Nutritionnelles des Plats de la Semaine
            </h3>
            <p className="text-xs text-[#7D7569]">
              Clique sur n'importe quel plat pour voir son analyse détaillée et sa répartition des macros
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tous' },
              { id: 'midi', label: '☀️ Midi' },
              { id: 'soir', label: '🌙 Soir' },
              { id: 'nutriscore-a', label: '🟢 Nutri-Score A/B' },
              { id: 'high-prot', label: '💪 Protéines 18g+' },
              { id: 'high-fiber', label: '🌾 Fibres' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterTag(f.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterTag === f.id
                    ? 'bg-[#433E37] text-white'
                    : 'bg-[#F4F1EB] text-[#7D7569] hover:bg-[#EAE5DC]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMeals.map((item, idx) => {
            const nutrition = calculateDishNutrition(item.recipe);
            return (
              <div
                key={`${item.recipe.id}-${idx}`}
                onClick={() => onInspectDish(item.recipe)}
                className="p-3.5 rounded-xl border border-[#E6E1D7] bg-[#FAF8F5] hover:bg-white hover:border-[#8BA888] hover:shadow-xs transition-all cursor-pointer space-y-2.5 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#A39E93] block">
                      {item.day} · {item.type}
                    </span>
                    <h4 className="text-xs font-bold text-[#433E37] group-hover:text-[#2E2A25] transition-colors line-clamp-1">
                      {item.recipe.name}
                    </h4>
                  </div>
                  <span className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${getNutriScoreColor(nutrition.nutriScore)}`}>
                    {nutrition.nutriScore}
                  </span>
                </div>

                {/* Macro Quick Badges */}
                <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] bg-white p-1.5 rounded-lg border border-[#E6E1D7]">
                  <div>
                    <span className="text-[#A39E93] block">Kcal</span>
                    <span className="font-bold text-[#433E37] font-mono-code">{nutrition.calories}</span>
                  </div>
                  <div>
                    <span className="text-[#8BA888] font-semibold block">Prot.</span>
                    <span className="font-bold text-[#3D593A] font-mono-code">{nutrition.proteins}g</span>
                  </div>
                  <div>
                    <span className="text-[#D97706] font-semibold block">Gluc.</span>
                    <span className="font-bold text-[#9A5304] font-mono-code">{nutrition.carbs}g</span>
                  </div>
                  <div>
                    <span className="text-[#8BA888] font-semibold block">Fibres</span>
                    <span className="font-bold text-[#3D593A] font-mono-code">{nutrition.fiber}g</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#A39E93] pt-1 border-t border-[#EAE5DC]">
                  <span>{item.recipe.time}</span>
                  <span className="text-[#8BA888] font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Voir détails <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

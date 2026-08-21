import React, { useMemo, useState } from 'react';
import { INGREDIENTS } from '../data/ingredients';
import { BASE_RECIPES } from '../data/recipes';
import { MealType, NutriScoreGrade, Recipe, StudentProfile } from '../types';
import { calculateDishEstimatedCost, isPremiumRecipe } from '../utils/budget';
import { calculateDishNutrition } from '../utils/nutrition';
import { getValidRecipes, isRecipeAllowed } from '../utils/planner';
import { analyzeRecipeSeasonality, MONTH_NAMES_FR } from '../utils/seasons';
import {
  Check,
  ChefHat,
  Clock,
  Filter,
  Flame,
  Heart,
  Info,
  Search,
  SlidersHorizontal,
  Sparkles,
  UtensilsCrossed,
  X
} from 'lucide-react';

interface MealPickerModalProps {
  isOpen: boolean;
  targetSlot: { dayIdx: number; dayName: string; type: MealType } | null;
  currentRecipeId: string | null;
  profile: StudentProfile;
  customRecipes: Record<MealType, Recipe[]>;
  storeProfileId: string;
  favoriteRecipeIds: string[];
  selectedSeasonMonth: number;
  onToggleFavorite: (recipeId: string) => void;
  onSelectRecipe: (dayIdx: number, type: MealType, recipeId: string) => void;
  onInspectRecipe: (recipe: Recipe) => void;
  onClose: () => void;
}

export const MealPickerModal: React.FC<MealPickerModalProps> = ({
  isOpen,
  targetSlot,
  currentRecipeId,
  profile,
  customRecipes,
  storeProfileId,
  favoriteRecipeIds,
  selectedSeasonMonth,
  onToggleFavorite,
  onSelectRecipe,
  onInspectRecipe,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFavoriteOnly, setFilterFavoriteOnly] = useState(false);
  const [filterSeasonalOnly, setFilterSeasonalOnly] = useState(false);
  const [filterQuickOnly, setFilterQuickOnly] = useState(false);
  const [filterVeggieOnly, setFilterVeggieOnly] = useState(false);
  const [filterEquipmentMatch, setFilterEquipmentMatch] = useState(true);
  const [filterBudget, setFilterBudget] = useState<'all' | 'premium' | 'eco'>('all');
  const [selectedNutriScore, setSelectedNutriScore] = useState<NutriScoreGrade | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'time' | 'nutri' | 'proteins-desc' | 'calories-asc'>('recommended');

  if (!isOpen || !targetSlot) return null;

  const { dayIdx, dayName, type } = targetSlot;

  // Aggregate candidate recipes for this meal type
  const allPool = useMemo(() => {
    const base = customRecipes ? (customRecipes[type] || []) : [];
    // Combine base and custom for this type
    const list = getValidRecipes(type, profile, customRecipes);
    // Include also any recipes that might be restricted by equipment if filterEquipmentMatch is false
    if (!filterEquipmentMatch) {
      const allBase = BASE_RECIPES[type] || [];
      const combined = [...allBase, ...base];
      return combined;
    }
    return list;
  }, [type, profile, customRecipes, filterEquipmentMatch]);

  // Filtered & Sorted recipes
  const filteredList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = allPool.filter(recipe => {
      // 1. Favorites only
      if (filterFavoriteOnly && !favoriteRecipeIds.includes(recipe.id)) {
        return false;
      }

      // 2. Seasonal only
      if (filterSeasonalOnly) {
        const season = analyzeRecipeSeasonality(recipe, selectedSeasonMonth);
        if (!season.isAllInSeason) return false;
      }

      // 3. Quick (< 15 min)
      if (filterQuickOnly) {
        const mins = parseInt((recipe.time.match(/\d+/) || ['99'])[0], 10);
        if (mins > 15) return false;
      }

      // 4. Veggie
      if (filterVeggieOnly) {
        const isVeggie = recipe.tags?.some(t => t.toLowerCase().includes('végé') || t.toLowerCase().includes('sans viande'));
        if (!isVeggie) return false;
      }

      // 5. Budget tier
      if (filterBudget === 'premium' && !isPremiumRecipe(recipe, storeProfileId)) {
        return false;
      }
      if (filterBudget === 'eco' && isPremiumRecipe(recipe, storeProfileId)) {
        return false;
      }

      // 6. Nutri-score
      if (selectedNutriScore !== 'all') {
        const nut = calculateDishNutrition(recipe);
        if (nut.nutriScore !== selectedNutriScore) return false;
      }

      // 7. Equipment filter
      if (filterEquipmentMatch && !isRecipeAllowed(recipe, profile)) {
        return false;
      }

      // 8. Search text
      if (query) {
        const nameMatch = recipe.name.toLowerCase().includes(query);
        const tagMatch = recipe.tags?.some(t => t.toLowerCase().includes(query));
        const ingMatch = recipe.ingredients.some(ing => {
          const ingInfo = INGREDIENTS[ing.id];
          return ing.id.toLowerCase().includes(query) || (ingInfo && ingInfo.name.toLowerCase().includes(query));
        });
        if (!nameMatch && !tagMatch && !ingMatch) return false;
      }

      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'recommended') {
        const favA = favoriteRecipeIds.includes(a.id) ? 1 : 0;
        const favB = favoriteRecipeIds.includes(b.id) ? 1 : 0;
        if (favA !== favB) return favB - favA;

        const seasonA = analyzeRecipeSeasonality(a, selectedSeasonMonth).isAllInSeason ? 1 : 0;
        const seasonB = analyzeRecipeSeasonality(b, selectedSeasonMonth).isAllInSeason ? 1 : 0;
        if (seasonA !== seasonB) return seasonB - seasonA;

        return calculateDishEstimatedCost(a, storeProfileId) - calculateDishEstimatedCost(b, storeProfileId);
      }
      if (sortBy === 'price-asc') {
        return calculateDishEstimatedCost(a, storeProfileId) - calculateDishEstimatedCost(b, storeProfileId);
      }
      if (sortBy === 'time') {
        const timeA = parseInt((a.time.match(/\d+/) || ['99'])[0], 10);
        const timeB = parseInt((b.time.match(/\d+/) || ['99'])[0], 10);
        return timeA - timeB;
      }
      if (sortBy === 'nutri') {
        const nutA = calculateDishNutrition(a).nutriScore;
        const nutB = calculateDishNutrition(b).nutriScore;
        return nutA.localeCompare(nutB);
      }
      if (sortBy === 'proteins-desc') {
        return calculateDishNutrition(b).proteins - calculateDishNutrition(a).proteins;
      }
      if (sortBy === 'calories-asc') {
        return calculateDishNutrition(a).calories - calculateDishNutrition(b).calories;
      }
      return 0;
    });
  }, [allPool, searchQuery, filterFavoriteOnly, filterSeasonalOnly, filterQuickOnly, filterVeggieOnly, filterEquipmentMatch, selectedNutriScore, sortBy, favoriteRecipeIds, selectedSeasonMonth, profile, storeProfileId]);

  const getNutriScoreBadge = (score: NutriScoreGrade) => {
    switch (score) {
      case 'A': return 'bg-[#8BA888] text-white';
      case 'B': return 'bg-[#9DB89A] text-white';
      case 'C': return 'bg-[#E2B37E] text-[#433E37]';
      case 'D': return 'bg-[#D97706] text-white';
      case 'E': return 'bg-[#B84A39] text-white';
      default: return 'bg-[#C2BBAF] text-white';
    }
  };

  const handleSelect = (recipeId: string) => {
    onSelectRecipe(dayIdx, type, recipeId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#433E37]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E6E1D7] bg-white flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                type === 'midi' ? 'bg-[#EBF2EA] text-[#3D593A] border-[#D1E0CE]' : 'bg-[#F4F1EB] text-[#433E37] border-[#E6E1D7]'
              }`}>
                {type === 'midi' ? '☀️ Déjeuner' : '🌙 Dîner'}
              </span>
              <span className="text-xs font-bold text-[#7D7569]">
                {dayName} (Jour {dayIdx + 1})
              </span>
              <span className="text-[11px] text-[#A39E93] hidden sm:inline font-mono-code">
                · Mois : {MONTH_NAMES_FR[selectedSeasonMonth - 1]}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#433E37]">
              Choisir un plat pour ce repas
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#A39E93] hover:text-[#433E37] hover:bg-[#F4F1EB] rounded-xl transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-white border-b border-[#E6E1D7] space-y-3 shrink-0">
          {/* Search Row */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A39E93]" />
              <input
                type="text"
                placeholder="Rechercher par nom, ingrédient (ex: poulet, pâtes, thon...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl text-[#433E37] placeholder-[#A39E93] focus:outline-none focus:border-[#8BA888] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A39E93] hover:text-[#433E37] p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort selection */}
            <div className="flex items-center gap-1.5 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#7D7569] hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl py-2 px-2.5 text-[#433E37] focus:outline-none focus:border-[#8BA888] cursor-pointer"
              >
                <option value="recommended">⭐ Recommandés (Favoris & Saison)</option>
                <option value="price-asc">Prix croissant (€)</option>
                <option value="time">Temps de préparation</option>
                <option value="nutri">Nutri-Score (A → E)</option>
                <option value="proteins-desc">Plus riche en protéines</option>
                <option value="calories-asc">Moins calorique</option>
              </select>
            </div>
          </div>

          {/* Filter Pills Row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {/* Favorites Toggle */}
            <button
              onClick={() => setFilterFavoriteOnly(!filterFavoriteOnly)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                filterFavoriteOnly
                  ? 'bg-[#B84A39] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#B84A39] hover:bg-[#FDF2F0] border border-[#E6E1D7]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${filterFavoriteOnly ? 'fill-white' : 'fill-none'}`} />
              <span>Favoris ({favoriteRecipeIds.length})</span>
            </button>

            {/* Seasonal Toggle */}
            <button
              onClick={() => setFilterSeasonalOnly(!filterSeasonalOnly)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                filterSeasonalOnly
                  ? 'bg-[#3D593A] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#3D593A] hover:bg-[#EBF2EA] border border-[#E6E1D7]'
              }`}
              title="Afficher uniquement les recettes dont tous les fruits et légumes sont de saison en ce moment"
            >
              <span>🌱 De saison</span>
            </button>

            {/* Budget / Plus cher Toggle */}
            <button
              onClick={() => setFilterBudget(filterBudget === 'premium' ? 'all' : 'premium')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterBudget === 'premium'
                  ? 'bg-[#D97706] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#D97706] hover:bg-[#FEF3C7]/40 border border-[#E6E1D7]'
              }`}
              title="Afficher les recettes plaisir / plus élaborées"
            >
              <span>💎 Plus cher</span>
            </button>

            <button
              onClick={() => setFilterBudget(filterBudget === 'eco' ? 'all' : 'eco')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterBudget === 'eco'
                  ? 'bg-[#8BA888] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#3D593A] hover:bg-[#EBF2EA] border border-[#E6E1D7]'
              }`}
              title="Afficher les recettes ultra-économiques"
            >
              <span>💰 Éco</span>
            </button>

            {/* Quick < 15 min */}
            <button
              onClick={() => setFilterQuickOnly(!filterQuickOnly)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterQuickOnly
                  ? 'bg-[#D97706] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#D97706] hover:bg-[#FDF6EE] border border-[#E6E1D7]'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>≤ 15 min</span>
            </button>

            {/* Veggie Toggle */}
            <button
              onClick={() => setFilterVeggieOnly(!filterVeggieOnly)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterVeggieOnly
                  ? 'bg-[#8BA888] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#433E37] hover:bg-[#F4F1EB] border border-[#E6E1D7]'
              }`}
            >
              <span>🥗 Végétarien</span>
            </button>

            {/* Equipment Match */}
            <button
              onClick={() => setFilterEquipmentMatch(!filterEquipmentMatch)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                filterEquipmentMatch
                  ? 'bg-[#433E37] text-white shadow-2xs'
                  : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#433E37] hover:bg-[#F4F1EB] border border-[#E6E1D7]'
              }`}
              title="Filtrer selon vos plaques, four et casseroles déclarés"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Mes ustensiles</span>
            </button>

            {/* NutriScore Grades */}
            <div className="flex items-center gap-1 ml-auto">
              {(['A', 'B', 'C', 'D', 'E'] as const).map(grade => (
                <button
                  key={grade}
                  onClick={() => setSelectedNutriScore(selectedNutriScore === grade ? 'all' : grade)}
                  className={`w-5 h-5 text-[10px] font-black rounded flex items-center justify-center transition-transform cursor-pointer ${
                    selectedNutriScore === grade
                      ? `${getNutriScoreBadge(grade)} scale-110 shadow-xs ring-2 ring-[#433E37]`
                      : 'bg-[#FAF8F5] text-[#7D7569] hover:opacity-80 border border-[#E6E1D7]'
                  }`}
                  title={`Filtrer Nutri-Score ${grade}`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#7D7569] font-medium px-1">
            <span>
              {filteredList.length} recette{filteredList.length > 1 ? 's disponibles' : ' disponible'}
            </span>
            {(filterFavoriteOnly || filterSeasonalOnly || filterQuickOnly || filterVeggieOnly || selectedNutriScore !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterFavoriteOnly(false);
                  setFilterSeasonalOnly(false);
                  setFilterQuickOnly(false);
                  setFilterVeggieOnly(false);
                  setSelectedNutriScore('all');
                }}
                className="text-[#3D593A] font-bold hover:underline cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {filteredList.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-[#DCD6CB] space-y-3">
              <ChefHat className="w-10 h-10 text-[#A39E93] mx-auto opacity-50" />
              <p className="text-sm font-semibold text-[#433E37]">
                Aucun plat ne correspond à vos critères de recherche.
              </p>
              <p className="text-xs text-[#7D7569]">
                Essayez d'élargir vos filtres ou de désactiver la restriction des ustensiles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map(recipe => {
                const isCurrent = currentRecipeId === recipe.id;
                const isFav = favoriteRecipeIds.includes(recipe.id);
                const nutrition = calculateDishNutrition(recipe);
                const cost = calculateDishEstimatedCost(recipe, storeProfileId);
                const seasonAnalysis = analyzeRecipeSeasonality(recipe, selectedSeasonMonth);

                return (
                  <div
                    key={recipe.id}
                    className={`bg-white rounded-2xl border p-4 transition-all flex flex-col justify-between shadow-2xs hover:shadow-md ${
                      isCurrent
                        ? 'border-[#8BA888] ring-2 ring-[#8BA888]/30 bg-[#FAFBF9]'
                        : 'border-[#E6E1D7] hover:border-[#DCD6CB]'
                    }`}
                  >
                    <div>
                      {/* Top bar with Favorite + Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Favorite Heart Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(recipe.id);
                            }}
                            className="p-1 text-[#A39E93] hover:text-[#B84A39] transition-colors rounded-lg cursor-pointer"
                            title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                          >
                            <Heart
                              className={`w-4 h-4 transition-transform active:scale-125 ${
                                isFav ? 'text-[#B84A39] fill-[#B84A39]' : 'hover:fill-[#B84A39]/20'
                              }`}
                            />
                          </button>

                          {/* Seasonal Badge */}
                          {seasonAnalysis.hasSeasonalProduce && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                seasonAnalysis.isAllInSeason
                                  ? 'bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE]'
                                  : 'bg-[#FDF6EE] text-[#D97706] border border-[#F4DECA]'
                              }`}
                              title={
                                seasonAnalysis.isAllInSeason
                                  ? 'Tous les fruits et légumes sont frais et de saison'
                                  : seasonAnalysis.outOfSeasonProduce
                                      .map(p => `${p.name} (saison : ${p.bestMonths})`)
                                      .join(', ')
                              }
                            >
                              {seasonAnalysis.isAllInSeason ? '🌱 De saison' : '⚠️ Hors saison'}
                            </span>
                          )}

                          {/* Plus cher / Premium badge */}
                          {isPremiumRecipe(recipe, storeProfileId) && (
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] flex items-center gap-0.5"
                              title="Recette plaisir / ingrédients plus chers"
                            >
                              💎 Plus cher
                            </span>
                          )}

                          {recipe.isCustom && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FDF6EE] text-[#D97706] border border-[#FAD7A0]">
                              Perso
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded ${getNutriScoreBadge(
                              nutrition.nutriScore
                            )}`}
                          >
                            {nutrition.nutriScore}
                          </span>
                          <span className="text-xs font-mono-code font-bold text-[#3D593A] bg-[#EBF2EA] px-2 py-0.5 rounded border border-[#D1E0CE]">
                            {cost.toFixed(2)}€
                          </span>
                        </div>
                      </div>

                      {/* Recipe Title */}
                      <h4
                        onClick={() => onInspectRecipe(recipe)}
                        className="font-bold text-sm text-[#433E37] hover:text-[#8BA888] cursor-pointer transition-colors leading-snug"
                      >
                        {recipe.name}
                      </h4>

                      {/* Time & Macros */}
                      <div className="flex items-center gap-3 text-[11px] text-[#7D7569] mt-1 font-mono-code">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#A39E93]" />
                          {recipe.time}
                        </span>
                        <span>·</span>
                        <span className="text-[#D97706] font-medium">{nutrition.calories} kcal</span>
                        <span>·</span>
                        <span className="text-[#3D593A] font-medium">{nutrition.proteins}g prot</span>
                      </div>

                      {/* Ingredients snippet */}
                      <p className="text-[11px] text-[#7D7569] mt-2 line-clamp-1">
                        {recipe.ingredients
                          .map(i => INGREDIENTS[i.id]?.name || i.id)
                          .join(', ')}
                      </p>
                    </div>

                    {/* Bottom Actions Row */}
                    <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#F4F1EB]">
                      <button
                        type="button"
                        onClick={() => onInspectRecipe(recipe)}
                        className="p-1.5 text-xs text-[#7D7569] hover:text-[#433E37] hover:bg-[#FAF8F5] rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Détails</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelect(recipe.id)}
                        className={`py-1.5 px-3 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE]'
                            : 'bg-[#8BA888] hover:bg-[#789675] text-white shadow-2xs active:scale-95'
                        }`}
                      >
                        {isCurrent ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Déjà planifié</span>
                          </>
                        ) : (
                          <>
                            <span>Choisir ce plat</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

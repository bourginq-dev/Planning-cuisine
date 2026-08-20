import React, { useMemo, useState } from 'react';
import { INGREDIENTS } from '../data/ingredients';
import { DayMealPlan, MealType, NutriScoreGrade, Recipe, StudentProfile } from '../types';
import { calculateDishEstimatedCost } from '../utils/budget';
import { calculateDishNutrition, getAllRecipes } from '../utils/nutrition';
import {
  BookOpen,
  CalendarPlus,
  Check,
  CheckCircle2,
  ChefHat,
  Clock,
  Copy,
  Edit2,
  Filter,
  Flame,
  Info,
  Layers,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Trash2,
  UtensilsCrossed,
  X
} from 'lucide-react';

interface RecipeManagerProps {
  profile: StudentProfile;
  customRecipes: Record<MealType, Recipe[]>;
  storeProfileId: string;
  extraShoppingRecipeIds: string[];
  weekPlan: DayMealPlan[];
  onOpenCreateRecipe: () => void;
  onOpenEditRecipe: (recipe: Recipe) => void;
  onDeleteCustomRecipe: (type: MealType, recipeId: string) => void;
  onDuplicateRecipe: (recipe: Recipe) => void;
  onAddRecipeToShopping: (recipeId: string) => void;
  onAddMultipleRecipesToShopping: (recipeIds: string[]) => void;
  onRemoveRecipeFromShopping: (recipeId: string) => void;
  onInspectRecipe: (recipe: Recipe) => void;
  onCookRecipe: (recipe: Recipe) => void;
  onAssignToPlan: (dayIdx: number, type: MealType, recipeId: string) => void;
  onNavigateToShopping: () => void;
}

export const RecipeManager: React.FC<RecipeManagerProps> = ({
  profile,
  customRecipes,
  storeProfileId,
  extraShoppingRecipeIds,
  weekPlan,
  onOpenCreateRecipe,
  onOpenEditRecipe,
  onDeleteCustomRecipe,
  onDuplicateRecipe,
  onAddRecipeToShopping,
  onAddMultipleRecipesToShopping,
  onRemoveRecipeFromShopping,
  onInspectRecipe,
  onCookRecipe,
  onAssignToPlan,
  onNavigateToShopping
}) => {
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<MealType | 'all'>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<'all' | 'custom' | 'base'>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedNutriScore, setSelectedNutriScore] = useState<NutriScoreGrade | 'all'>('all');
  const [sortBy, setSortBy] = useState<'default' | 'name' | 'price-asc' | 'time' | 'calories-asc' | 'proteins-desc'>('default');

  // Multi-selection state for batch shopping list addition
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle?: string } | null>(null);

  // Quick Plan Assignment Modal / Popover state
  const [planningRecipe, setPlanningRecipe] = useState<Recipe | null>(null);
  const [planDayIdx, setPlanDayIdx] = useState<number>(0);
  const [planSlotType, setPlanSlotType] = useState<MealType>('soir');

  // Aggregate all recipes
  const allRecipes = useMemo(() => {
    return getAllRecipes(customRecipes);
  }, [customRecipes]);

  // Extract all unique tags for quick filter chips
  const allAvailableTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allRecipes.forEach(r => {
      if (r.tags) {
        r.tags.forEach(t => tagsSet.add(t));
      }
    });
    return Array.from(tagsSet);
  }, [allRecipes]);

  // Filter and sort recipes
  const filteredRecipes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = allRecipes.filter(recipe => {
      // 1. Meal Type filter
      if (selectedMealType !== 'all' && recipe.type !== selectedMealType) {
        return false;
      }

      // 2. Origin filter (custom vs base)
      if (selectedOrigin === 'custom' && !recipe.isCustom) {
        return false;
      }
      if (selectedOrigin === 'base' && recipe.isCustom) {
        return false;
      }

      // 3. NutriScore filter
      if (selectedNutriScore !== 'all') {
        const nut = calculateDishNutrition(recipe);
        if (nut.nutriScore !== selectedNutriScore) {
          return false;
        }
      }

      // 4. Tag filter
      if (selectedTag !== 'all') {
        if (!recipe.tags || !recipe.tags.includes(selectedTag)) {
          return false;
        }
      }

      // 5. Search Query (matches name, ingredients, tags, instructions)
      if (query) {
        const nameMatch = recipe.name.toLowerCase().includes(query);
        const tagMatch = recipe.tags?.some(t => t.toLowerCase().includes(query));
        const stepMatch = recipe.steps.some(s => s.toLowerCase().includes(query));
        const ingredientMatch = recipe.ingredients.some(ing => {
          const ingInfo = INGREDIENTS[ing.id];
          return (
            ing.id.toLowerCase().includes(query) ||
            (ingInfo && ingInfo.name.toLowerCase().includes(query))
          );
        });

        if (!nameMatch && !tagMatch && !stepMatch && !ingredientMatch) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'price-asc') {
        return calculateDishEstimatedCost(a, storeProfileId) - calculateDishEstimatedCost(b, storeProfileId);
      }
      if (sortBy === 'time') {
        const timeA = parseInt((a.time.match(/\d+/) || ['99'])[0], 10);
        const timeB = parseInt((b.time.match(/\d+/) || ['99'])[0], 10);
        return timeA - timeB;
      }
      if (sortBy === 'calories-asc') {
        return calculateDishNutrition(a).calories - calculateDishNutrition(b).calories;
      }
      if (sortBy === 'proteins-desc') {
        return calculateDishNutrition(b).proteins - calculateDishNutrition(a).proteins;
      }
      return 0;
    });
  }, [allRecipes, searchQuery, selectedMealType, selectedOrigin, selectedNutriScore, selectedTag, sortBy, storeProfileId]);

  // Statistics
  const customCount = useMemo(() => {
    return (customRecipes.midi?.length || 0) + (customRecipes.soir?.length || 0);
  }, [customRecipes]);

  // Toast trigger
  const showToast = (title: string, subtitle?: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Toggle selection for single recipe
  const toggleSelectRecipe = (id: string) => {
    setSelectedRecipeIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all currently filtered recipes
  const handleSelectAllFiltered = () => {
    const filteredIds = filteredRecipes.map(r => r.id);
    const allSelected = filteredIds.every(id => selectedRecipeIds.includes(id));
    if (allSelected) {
      setSelectedRecipeIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      setSelectedRecipeIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Handle batch adding to shopping list
  const handleBatchAddToShopping = () => {
    if (selectedRecipeIds.length === 0) return;
    onAddMultipleRecipesToShopping(selectedRecipeIds);
    showToast(
      `🛒 ${selectedRecipeIds.length} recette${selectedRecipeIds.length > 1 ? 's ajoutées' : ' ajoutée'} aux courses !`,
      'Tous les ingrédients nécessaires sont maintenant inclus dans votre ticket.'
    );
    setSelectedRecipeIds([]);
  };

  // Single add to shopping list
  const handleSingleAddToShopping = (recipe: Recipe) => {
    onAddRecipeToShopping(recipe.id);
    showToast(
      `🛒 "${recipe.name}" ajoutée aux courses !`,
      `${recipe.ingredients.length} ingrédient${recipe.ingredients.length > 1 ? 's ajoutés' : ' ajouté'} automatiquement.`
    );
  };

  // Plan assign submit
  const handleConfirmPlanAssignment = () => {
    if (!planningRecipe) return;
    onAssignToPlan(planDayIdx, planSlotType, planningRecipe.id);
    const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const slotNames: Record<MealType, string> = { midi: 'Midi', soir: 'Soir' };
    showToast(
      `📅 Plat programmé !`,
      `"${planningRecipe.name}" est placé pour le ${dayNames[planDayIdx]} (${slotNames[planSlotType]}).`
    );
    setPlanningRecipe(null);
  };

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

  const dayLabels = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#433E37] text-white p-4 rounded-2xl shadow-xl border border-[#FAF8F5]/20 flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-200 max-w-md">
          <div className="w-8 h-8 rounded-xl bg-[#8BA888] text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 font-bold" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm text-white">{toastMessage.title}</h4>
            {toastMessage.subtitle && (
              <p className="text-[#E6E1D7] mt-0.5">{toastMessage.subtitle}</p>
            )}
            <button
              onClick={onNavigateToShopping}
              className="mt-2 text-xs font-bold text-[#D97706] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Voir la liste de courses →
            </button>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#A39E93] hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Stats & Creation CTA */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E1D7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FDF6EE] text-[#D97706] border border-[#F4DECA]">
              Catalogue & Recettes
            </span>
            <span className="text-xs text-[#7D7569]">
              {allRecipes.length} recettes au total ({customCount} créations perso)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#433E37] tracking-tight flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-[#8BA888]" />
            Livre de Recettes & Gestionnaire
          </h2>
          <p className="text-xs sm:text-sm text-[#7D7569] max-w-2xl leading-relaxed">
            Crée tes propres recettes étudiantes avec ingrédients et valeurs nutritionnelles, recherche par mots-clés ou ingrédients, et ajoute instantanément tous les ingrédients nécessaires à ta liste de courses.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateRecipe}
            className="px-4 py-2.5 bg-[#433E37] hover:bg-[#332F2A] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xs transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#8BA888]" />
            <span>Créer une recette</span>
          </button>

          {extraShoppingRecipeIds.length > 0 && (
            <button
              onClick={onNavigateToShopping}
              className="px-3.5 py-2.5 bg-[#EBF2EA] hover:bg-[#DDE9DB] text-[#3D593A] font-bold text-xs rounded-xl flex items-center gap-2 border border-[#D1E0CE] transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{extraShoppingRecipeIds.length} au ticket de courses</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D7] shadow-xs space-y-4">
        {/* Search input + Sorting row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A39E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, ingrédient (ex: poulet, pâtes, thon, pois chiches), tag ou étape..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl text-[#433E37] placeholder-[#A39E93] focus:outline-none focus:border-[#8BA888] focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A39E93] hover:text-[#433E37] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-4 h-4 text-[#7D7569] hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl py-2.5 px-3 text-[#433E37] focus:outline-none focus:border-[#8BA888] cursor-pointer"
            >
              <option value="default">Tri par défaut</option>
              <option value="name">Nom (A → Z)</option>
              <option value="price-asc">Prix estimé croissant (€)</option>
              <option value="time">Temps de préparation</option>
              <option value="calories-asc">Calories (Moins calorique)</option>
              <option value="proteins-desc">Protéines (Plus protéiné)</option>
            </select>
          </div>
        </div>

        {/* Meal type & Origin pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6E1D7]">
          {/* Meal Types */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#7D7569] mr-1">Repas :</span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'midi', label: '☀️ Midi' },
              { id: 'soir', label: '🌙 Soir' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedMealType(tab.id as any)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedMealType === tab.id
                    ? 'bg-[#433E37] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#433E37] hover:bg-[#F4F1EB] border border-[#E6E1D7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Origin filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-[#7D7569] mr-1">Origine :</span>
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'custom', label: `⭐ Mes créations (${customCount})` },
              { id: 'base', label: '📚 Base étudiante' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedOrigin(tab.id as any)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedOrigin === tab.id
                    ? 'bg-[#8BA888] text-white shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#433E37] hover:bg-[#F4F1EB] border border-[#E6E1D7]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* NutriScore & Tags row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6E1D7]">
          {/* NutriScore grade filter */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-[#7D7569] mr-1">Nutri-Score :</span>
            <button
              onClick={() => setSelectedNutriScore('all')}
              className={`px-2 py-0.5 text-xs font-bold rounded ${
                selectedNutriScore === 'all'
                  ? 'bg-[#433E37] text-white'
                  : 'bg-[#FAF8F5] text-[#7D7569] hover:bg-[#F4F1EB] border border-[#E6E1D7]'
              }`}
            >
              Tous
            </button>
            {(['A', 'B', 'C', 'D', 'E'] as const).map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedNutriScore(selectedNutriScore === grade ? 'all' : grade)}
                className={`w-6 h-6 text-xs font-black rounded flex items-center justify-center transition-transform ${
                  selectedNutriScore === grade
                    ? `${getNutriScoreBadge(grade)} scale-110 shadow-xs ring-2 ring-[#433E37]`
                    : 'bg-[#FAF8F5] text-[#7D7569] hover:opacity-80 border border-[#E6E1D7]'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          {/* Quick Tags Filter Pills */}
          {allAvailableTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 max-w-full overflow-x-auto">
              <span className="text-xs font-bold text-[#7D7569] mr-1">Tags :</span>
              <button
                onClick={() => setSelectedTag('all')}
                className={`px-2 py-0.5 text-xs rounded-full cursor-pointer transition-colors ${
                  selectedTag === 'all'
                    ? 'bg-[#433E37] text-white font-bold'
                    : 'bg-[#FAF8F5] text-[#7D7569] hover:bg-[#F4F1EB] border border-[#E6E1D7]'
                }`}
              >
                Tous
              </button>
              {allAvailableTags.slice(0, 7).map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? 'all' : tag)}
                  className={`px-2 py-0.5 text-xs rounded-full cursor-pointer transition-colors ${
                    selectedTag === tag
                      ? 'bg-[#D97706] text-white font-bold shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#433E37] hover:bg-[#F4F1EB] border border-[#E6E1D7]'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Batch Actions Bar (when 1+ recipes are checked) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DCD6CB]">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-[#433E37] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={
                filteredRecipes.length > 0 &&
                filteredRecipes.every(r => selectedRecipeIds.includes(r.id))
              }
              onChange={handleSelectAllFiltered}
              className="w-4 h-4 text-[#8BA888] rounded border-[#DCD6CB] focus:ring-[#8BA888] cursor-pointer"
            />
            <span>Sélectionner tout ({filteredRecipes.length} recettes affichées)</span>
          </label>

          {selectedRecipeIds.length > 0 && (
            <span className="text-xs font-mono-code bg-[#433E37] text-white px-2 py-0.5 rounded-full font-bold">
              {selectedRecipeIds.length} sélectionnée{selectedRecipeIds.length > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {selectedRecipeIds.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchAddToShopping}
              className="px-3 py-1.5 bg-[#8BA888] hover:bg-[#789675] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Ajouter la sélection à la liste de courses</span>
            </button>
            <button
              onClick={() => setSelectedRecipeIds([])}
              className="px-2.5 py-1.5 text-xs text-[#7D7569] hover:text-[#433E37] bg-white rounded-xl border border-[#E6E1D7] cursor-pointer"
            >
              Désélectionner
            </button>
          </div>
        )}
      </div>

      {/* Recipes Cards Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E6E1D7] space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-[#A39E93]" />
          <h3 className="font-bold text-lg text-[#433E37]">Aucune recette ne correspond à votre recherche</h3>
          <p className="text-xs sm:text-sm text-[#7D7569] max-w-md mx-auto">
            Essaie de modifier tes filtres ou tes mots-clés, ou crée une nouvelle recette sur-mesure !
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedMealType('all');
                setSelectedOrigin('all');
                setSelectedNutriScore('all');
                setSelectedTag('all');
              }}
              className="px-4 py-2 bg-[#F4F1EB] hover:bg-[#EAE5DC] text-[#433E37] text-xs font-bold rounded-xl border border-[#E6E1D7] cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
            <button
              onClick={onOpenCreateRecipe}
              className="px-4 py-2 bg-[#433E37] hover:bg-[#332F2A] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#8BA888]" />
              Créer cette recette
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecipes.map(recipe => {
            const nutrition = calculateDishNutrition(recipe);
            const cost = calculateDishEstimatedCost(recipe, storeProfileId);
            const isSelected = selectedRecipeIds.includes(recipe.id);
            const isAddedToShopping = extraShoppingRecipeIds.includes(recipe.id);

            return (
              <div
                key={recipe.id}
                className={`bg-white rounded-2xl border transition-all flex flex-col overflow-hidden shadow-xs hover:shadow-md ${
                  isSelected ? 'border-[#8BA888] ring-2 ring-[#8BA888]/20' : 'border-[#E6E1D7] hover:border-[#DCD6CB]'
                }`}
              >
                {/* Card Header Top */}
                <div className="p-4 bg-[#FAF8F5] border-b border-[#E6E1D7] flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRecipe(recipe.id)}
                      className="w-4 h-4 text-[#8BA888] rounded border-[#DCD6CB] focus:ring-[#8BA888] cursor-pointer"
                      title="Sélectionner pour action groupée"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#433E37] border border-[#E6E1D7]">
                      {recipe.type === 'midi' ? '☀️ Midi' : '🌙 Soir'}
                    </span>
                    {recipe.isCustom && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FDF6EE] text-[#D97706] border border-[#FAD7A0] flex items-center gap-0.5">
                        ⭐ Perso
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* NutriScore Badge */}
                    <span
                      className={`text-[11px] font-black px-2 py-0.5 rounded ${getNutriScoreBadge(
                        nutrition.nutriScore
                      )}`}
                      title={`Nutri-Score ${nutrition.nutriScore}`}
                    >
                      {nutrition.nutriScore}
                    </span>
                    {/* Cost pill */}
                    <span className="text-xs font-mono-code font-bold text-[#3D593A] bg-[#EBF2EA] px-2 py-0.5 rounded border border-[#D1E0CE]">
                      {cost.toFixed(2)}€
                    </span>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="p-4 flex-1 space-y-3 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3
                      onClick={() => onInspectRecipe(recipe)}
                      className="font-bold text-[#433E37] text-base hover:text-[#8BA888] transition-colors cursor-pointer leading-snug"
                    >
                      {recipe.name}
                    </h3>

                    {/* Time & Equipment */}
                    <div className="flex items-center gap-2 text-xs text-[#7D7569] mt-1 font-mono-code">
                      <Clock className="w-3.5 h-3.5 text-[#A39E93]" />
                      <span>{recipe.time}</span>
                    </div>

                    {/* Tags */}
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 bg-[#FAF8F5] text-[#7D7569] rounded-md border border-[#E6E1D7]"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ingredients Preview */}
                  <div className="space-y-1.5 pt-2 border-t border-[#E6E1D7]">
                    <div className="text-[11px] font-bold text-[#7D7569] uppercase tracking-wider flex items-center justify-between">
                      <span>Ingrédients ({recipe.ingredients.length})</span>
                      <span className="text-[#A39E93] font-mono-code lowercase text-[10px]">
                        {nutrition.calories} kcal · {nutrition.proteins}g prot
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {recipe.ingredients.map(ing => {
                        const ingInfo = INGREDIENTS[ing.id];
                        return (
                          <span
                            key={ing.id}
                            className="text-[11px] bg-[#FAF8F5] text-[#433E37] px-2 py-0.5 rounded border border-[#E6E1D7] flex items-center gap-1 font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#8BA888]" />
                            {ingInfo?.name || ing.id}
                            <span className="text-[#7D7569] font-mono-code text-[10px]">
                              ({ing.qty}{ingInfo?.unit || ''})
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nutritional mini pill */}
                  <div className="grid grid-cols-4 gap-1 p-2 bg-[#FAF8F5] rounded-xl text-center text-[10px] font-mono-code border border-[#E6E1D7]">
                    <div>
                      <span className="text-[#A39E93] block">Cal.</span>
                      <span className="font-bold text-[#D97706]">{nutrition.calories}</span>
                    </div>
                    <div>
                      <span className="text-[#A39E93] block">Prot.</span>
                      <span className="font-bold text-[#3D593A]">{nutrition.proteins}g</span>
                    </div>
                    <div>
                      <span className="text-[#A39E93] block">Gluc.</span>
                      <span className="font-bold text-[#7D7569]">{nutrition.carbs}g</span>
                    </div>
                    <div>
                      <span className="text-[#A39E93] block">Fibr.</span>
                      <span className="font-bold text-[#3D593A]">{nutrition.fiber}g</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-[#FAF8F5] border-t border-[#E6E1D7] space-y-2">
                  {/* Primary Actions Row */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Add to Shopping List Button */}
                    <button
                      onClick={() => {
                        if (isAddedToShopping) {
                          onRemoveRecipeFromShopping(recipe.id);
                        } else {
                          handleSingleAddToShopping(recipe);
                        }
                      }}
                      className={`py-2 px-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isAddedToShopping
                          ? 'bg-[#EBF2EA] text-[#3D593A] border border-[#D1E0CE] hover:bg-[#DDE9DB]'
                          : 'bg-[#8BA888] hover:bg-[#789675] text-white shadow-2xs active:scale-95'
                      }`}
                      title={isAddedToShopping ? 'Retirer du ticket de courses' : 'Ajouter tous les ingrédients à la liste de courses'}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isAddedToShopping ? '✓ Au ticket' : '+ Courses'}</span>
                    </button>

                    {/* Quick Assign to Planning */}
                    <button
                      onClick={() => setPlanningRecipe(recipe)}
                      className="py-2 px-2.5 text-xs font-bold bg-[#F4F1EB] hover:bg-[#EAE5DC] text-[#433E37] border border-[#E6E1D7] rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Placer dans le planning hebdomadaire"
                    >
                      <CalendarPlus className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>Planifier</span>
                    </button>
                  </div>

                  {/* Secondary buttons: Detail, Cook, Edit, Duplicate, Delete */}
                  <div className="flex items-center justify-between gap-1 pt-1 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onInspectRecipe(recipe)}
                        className="p-1.5 text-[#7D7569] hover:text-[#433E37] hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Voir la fiche détaillée & nutrition"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onCookRecipe(recipe)}
                        className="p-1.5 text-[#7D7569] hover:text-[#3D593A] hover:bg-[#EBF2EA] rounded-lg transition-colors cursor-pointer"
                        title="Démarrer le mode cuisine pas à pas"
                      >
                        <UtensilsCrossed className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicateRecipe(recipe)}
                        className="p-1.5 text-[#7D7569] hover:text-[#D97706] hover:bg-[#FDF6EE] rounded-lg transition-colors cursor-pointer"
                        title="Dupliquer et adapter comme recette personnalisée"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {recipe.isCustom && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenEditRecipe(recipe)}
                          className="p-1.5 text-[#7D7569] hover:text-[#433E37] hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Modifier cette recette"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer définitivement la recette "${recipe.name}" ?`)) {
                              onDeleteCustomRecipe(recipe.type, recipe.id);
                            }
                          }}
                          className="p-1.5 text-[#B84A39] hover:text-[#9A382A] hover:bg-[#FDF2F0] rounded-lg transition-colors cursor-pointer"
                          title="Supprimer la recette personnalisée"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Assignment Modal */}
      {planningRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#433E37]/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 bg-white border-b border-[#E6E1D7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-[#8BA888]" />
                <h3 className="font-bold text-base text-[#433E37]">
                  Ajouter au planning
                </h3>
              </div>
              <button
                onClick={() => setPlanningRecipe(null)}
                className="p-1 text-[#A39E93] hover:text-[#433E37] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-white rounded-xl border border-[#E6E1D7] space-y-1">
                <span className="text-[10px] text-[#A39E93] uppercase font-bold tracking-wider">Recette choisie</span>
                <p className="font-bold text-sm text-[#433E37]">{planningRecipe.name}</p>
                <p className="text-[#7D7569]">{planningRecipe.time}</p>
              </div>

              <div>
                <label className="font-bold text-[#433E37] block mb-1.5">
                  Jour de la semaine :
                </label>
                <select
                  value={planDayIdx}
                  onChange={(e) => setPlanDayIdx(parseInt(e.target.value, 10))}
                  className="w-full bg-white border border-[#DCD6CB] rounded-xl p-2.5 text-[#433E37] font-semibold focus:outline-none focus:border-[#8BA888]"
                >
                  {dayLabels.map((day, idx) => (
                    <option key={idx} value={idx}>
                      {day} {weekPlan[idx]?.weekend ? '(Week-end)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#433E37] block mb-1.5">
                  Moment du repas :
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'midi', label: '☀️ Midi' },
                    { id: 'soir', label: '🌙 Soir' }
                  ].map(slot => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setPlanSlotType(slot.id as MealType)}
                      className={`p-2.5 rounded-xl font-bold border transition-colors cursor-pointer text-center ${
                        planSlotType === slot.id
                          ? 'bg-[#433E37] text-white border-[#433E37]'
                          : 'bg-white text-[#7D7569] border-[#DCD6CB] hover:border-[#8BA888]'
                      }`}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-[#E6E1D7] flex items-center justify-end gap-2">
              <button
                onClick={() => setPlanningRecipe(null)}
                className="px-4 py-2 text-xs font-semibold text-[#7D7569] hover:text-[#433E37] bg-[#F4F1EB] rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPlanAssignment}
                className="px-4 py-2 text-xs font-bold text-white bg-[#8BA888] hover:bg-[#789675] rounded-xl shadow-xs cursor-pointer"
              >
                Confirmer l'ajout au planning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

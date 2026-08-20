import React, { useEffect, useMemo, useState } from 'react';
import { INGREDIENTS } from '../data/ingredients';
import { MealType, NutritionalValues, Recipe, RecipeIngredient } from '../types';
import { calculateDishNutrition } from '../utils/nutrition';
import {
  Bot,
  Calculator,
  Check,
  ClipboardPaste,
  Flame,
  HelpCircle,
  Info,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  Trash2,
  X
} from 'lucide-react';

interface CustomRecipeModalProps {
  isOpen: boolean;
  editingRecipe?: Recipe | null;
  onClose: () => void;
  onSaveRecipe: (type: MealType, recipe: Recipe) => void;
  onUpdateRecipe?: (type: MealType, recipe: Recipe) => void;
}

const PRESET_TAGS = [
  'Végétarien',
  'Riche en protéines',
  'Express (< 15 min)',
  'Budget mini (< 1.50€)',
  'Sans cuisson',
  'Micro-ondes',
  'One-pot / 1 poêle',
  'Batch cooking',
  'Familial',
  'Plaisir'
];

export const CustomRecipeModal: React.FC<CustomRecipeModalProps> = ({
  isOpen,
  editingRecipe,
  onClose,
  onSaveRecipe,
  onUpdateRecipe
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');

  // Manual Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<MealType>('soir');
  const [time, setTime] = useState('15 min · 1 poêle');
  const [steps, setSteps] = useState<string[]>(['']);
  const [ingredientsList, setIngredientsList] = useState<RecipeIngredient[]>([
    { id: 'pates', qty: 100 }
  ]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Ingredient picker temporary inputs
  const [currentIngId, setCurrentIngId] = useState('fromage');
  const [currentIngQty, setCurrentIngQty] = useState<number>(30);
  const [ingredientSearch, setIngredientSearch] = useState('');

  // Optional custom nutritional values state
  const [useCustomNutrition, setUseCustomNutrition] = useState(false);
  const [customCalories, setCustomCalories] = useState<string>('');
  const [customProteins, setCustomProteins] = useState<string>('');
  const [customCarbs, setCustomCarbs] = useState<string>('');
  const [customFats, setCustomFats] = useState<string>('');
  const [customFiber, setCustomFiber] = useState<string>('');

  // Import JSON State
  const [jsonText, setJsonText] = useState('');

  // Sync with editingRecipe when opened
  useEffect(() => {
    if (isOpen) {
      if (editingRecipe) {
        setName(editingRecipe.name);
        setType(editingRecipe.type);
        setTime(editingRecipe.time);
        setSteps(editingRecipe.steps.length > 0 ? [...editingRecipe.steps] : ['']);
        setIngredientsList(
          editingRecipe.ingredients.length > 0
            ? [...editingRecipe.ingredients]
            : [{ id: 'pates', qty: 100 }]
        );
        setSelectedTags(editingRecipe.tags ? [...editingRecipe.tags] : ['Recette personnalisée']);

        if (editingRecipe.customNutrition) {
          setUseCustomNutrition(true);
          setCustomCalories(editingRecipe.customNutrition.calories?.toString() || '');
          setCustomProteins(editingRecipe.customNutrition.proteins?.toString() || '');
          setCustomCarbs(editingRecipe.customNutrition.carbs?.toString() || '');
          setCustomFats(editingRecipe.customNutrition.fats?.toString() || '');
          setCustomFiber(editingRecipe.customNutrition.fiber?.toString() || '');
        } else {
          setUseCustomNutrition(false);
          setCustomCalories('');
          setCustomProteins('');
          setCustomCarbs('');
          setCustomFats('');
          setCustomFiber('');
        }
      } else {
        // Reset to default new recipe form
        setName('');
        setType('soir');
        setTime('15 min · 1 poêle');
        setSteps(['']);
        setIngredientsList([{ id: 'pates', qty: 100 }]);
        setSelectedTags(['Recette personnalisée']);
        setUseCustomNutrition(false);
        setCustomCalories('');
        setCustomProteins('');
        setCustomCarbs('');
        setCustomFats('');
        setCustomFiber('');
        setJsonText('');
      }
    }
  }, [isOpen, editingRecipe]);

  // Live auto-calculated nutrition summary from chosen ingredients
  const livePreviewRecipe: Recipe = useMemo(() => {
    return {
      id: 'temp_preview',
      name: name || 'Aperçu',
      type,
      time,
      steps: steps.filter(s => s.trim().length > 0),
      ingredients: ingredientsList,
      tags: selectedTags,
      customNutrition: useCustomNutrition
        ? {
            calories: customCalories ? parseFloat(customCalories) : undefined,
            proteins: customProteins ? parseFloat(customProteins) : undefined,
            carbs: customCarbs ? parseFloat(customCarbs) : undefined,
            fats: customFats ? parseFloat(customFats) : undefined,
            fiber: customFiber ? parseFloat(customFiber) : undefined
          }
        : undefined
    };
  }, [name, type, time, steps, ingredientsList, selectedTags, useCustomNutrition, customCalories, customProteins, customCarbs, customFats, customFiber]);

  const liveNutrition = useMemo(() => {
    return calculateDishNutrition(livePreviewRecipe);
  }, [livePreviewRecipe]);

  if (!isOpen) return null;

  // Filtered ingredients catalog for the select dropdown
  const filteredCatalog = Object.values(INGREDIENTS).filter(ing =>
    ingredientSearch ? ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()) || ing.cat.toLowerCase().includes(ingredientSearch.toLowerCase()) : true
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleAddIngredient = () => {
    if (!currentIngId || currentIngQty <= 0) return;
    setIngredientsList(prev => [...prev, { id: currentIngId, qty: currentIngQty }]);
    setCurrentIngQty(1);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredientsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setSteps(prev => [...prev, '']);
  };

  const handleUpdateStep = (index: number, val: string) => {
    setSteps(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      setSteps(['']);
      return;
    }
    setSteps(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (t: string) => {
    setSelectedTags(prev =>
      prev.includes(t) ? prev.filter(item => item !== t) : [...prev, t]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newTagInput.trim()) {
      const formatted = newTagInput.trim();
      if (!selectedTags.includes(formatted)) {
        setSelectedTags(prev => [...prev, formatted]);
      }
      setNewTagInput('');
    }
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Veuillez renseigner le nom de la recette.');
      return;
    }
    if (ingredientsList.length === 0) {
      alert('Veuillez ajouter au moins un ingrédient à la recette.');
      return;
    }

    const cleanSteps = steps
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let customNutritionObj: Partial<NutritionalValues> | undefined = undefined;
    if (useCustomNutrition) {
      customNutritionObj = {
        calories: customCalories ? Math.max(0, parseFloat(customCalories)) : undefined,
        proteins: customProteins ? Math.max(0, parseFloat(customProteins)) : undefined,
        carbs: customCarbs ? Math.max(0, parseFloat(customCarbs)) : undefined,
        fats: customFats ? Math.max(0, parseFloat(customFats)) : undefined,
        fiber: customFiber ? Math.max(0, parseFloat(customFiber)) : undefined
      };
    }

    const recipePayload: Recipe = {
      id: editingRecipe?.id || `custom_${Date.now()}`,
      name: name.trim(),
      type,
      time: time.trim() || '15 min · 1 poêle',
      steps: cleanSteps.length > 0 ? cleanSteps : ['Préparer les ingrédients et servir.'],
      ingredients: ingredientsList,
      tags: selectedTags.length > 0 ? selectedTags : ['Recette personnalisée'],
      isCustom: true,
      customNutrition: customNutritionObj
    };

    if (editingRecipe && onUpdateRecipe) {
      onUpdateRecipe(type, recipePayload);
    } else {
      onSaveRecipe(type, recipePayload);
    }

    onClose();
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonText(text);
    } catch (e) {
      alert('Impossible d’accéder au presse-papiers. Veuillez coller le texte manuellement.');
    }
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.name || !parsed.steps || !Array.isArray(parsed.ingredients)) {
        throw new Error('Champs requis manquants dans le JSON (name, steps, ingredients)');
      }

      const validIngredients = parsed.ingredients
        .filter((ing: any) => INGREDIENTS[ing.id])
        .map((ing: any) => ({
          id: ing.id,
          qty: parseFloat(ing.qty) || 1
        }));

      if (validIngredients.length === 0) {
        throw new Error('Aucun ingrédient valide reconnu parmi la base d’ingrédients.');
      }

      const recipeType: MealType = ['midi', 'soir'].includes(parsed.type) ? parsed.type : 'soir';

      let parsedCustomNutrition: Partial<NutritionalValues> | undefined = undefined;
      if (parsed.customNutrition || parsed.nutrition || parsed.calories) {
        const nutSource = parsed.customNutrition || parsed.nutrition || parsed;
        parsedCustomNutrition = {
          calories: typeof nutSource.calories === 'number' ? nutSource.calories : undefined,
          proteins: typeof nutSource.proteins === 'number' ? nutSource.proteins : undefined,
          carbs: typeof nutSource.carbs === 'number' ? nutSource.carbs : undefined,
          fats: typeof nutSource.fats === 'number' ? nutSource.fats : undefined,
          fiber: typeof nutSource.fiber === 'number' ? nutSource.fiber : undefined
        };
      }

      const importedRecipe: Recipe = {
        id: editingRecipe?.id || `custom_ai_${Date.now()}`,
        name: parsed.name,
        type: recipeType,
        time: parsed.time || '15 min · poêle',
        steps: Array.isArray(parsed.steps) ? parsed.steps : [parsed.steps],
        ingredients: validIngredients,
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['Import IA', 'Recette personnalisée'],
        isCustom: true,
        customNutrition: parsedCustomNutrition
      };

      if (editingRecipe && onUpdateRecipe) {
        onUpdateRecipe(recipeType, importedRecipe);
      } else {
        onSaveRecipe(recipeType, importedRecipe);
      }

      onClose();
    } catch (err: any) {
      alert(`Erreur d'import : ${err.message || 'Format JSON invalide'}`);
    }
  };

  const currentIngDetails = INGREDIENTS[currentIngId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#433E37]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] bg-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#D97706]">
              {editingRecipe ? 'Édition de recette' : 'Création de recette'}
            </span>
            <h3 className="text-lg font-bold text-[#433E37] leading-tight">
              {editingRecipe ? `Modifier : ${editingRecipe.name}` : 'Ajouter une Nouvelle Recette'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A39E93] hover:text-[#433E37] hover:bg-[#F4F1EB] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-3 bg-[#F4F1EB] border-b border-[#E6E1D7] flex justify-center gap-2">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white text-[#433E37] shadow-2xs border border-[#E6E1D7]'
                : 'text-[#7D7569] hover:text-[#433E37]'
            }`}
          >
            ✍️ Formulaire Complet & Nutrition
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'import'
                ? 'bg-[#8BA888] text-white shadow-2xs'
                : 'text-[#7D7569] hover:text-[#433E37]'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            🤖 Import Intelligent (JSON / IA)
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {activeTab === 'manual' ? (
            <form onSubmit={handleSaveManual} className="space-y-5 text-xs">
              {/* Basic Information */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E6E1D7]">
                <h4 className="font-bold text-[#433E37] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                  1. Informations Générales
                </h4>

                <div>
                  <label className="font-bold text-[#433E37] block mb-1">Nom du plat *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex : Salade tiède de lentilles, thon & moutarde"
                    className="w-full bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl p-2.5 text-[#433E37] font-semibold focus:outline-none focus:border-[#8BA888]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#433E37] block mb-1">Moment du repas</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as MealType)}
                      className="w-full bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl p-2.5 text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                    >
                      <option value="midi">☀️ Midi (Rapide / Déjeuner)</option>
                      <option value="soir">🌙 Soir (Complet / Dîner)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#433E37] block mb-1">Temps & Équipement</label>
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      placeholder="Ex : 12 min · 1 poêle"
                      className="w-full bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl p-2.5 text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                    />
                  </div>
                </div>

                {/* Tags selection */}
                <div>
                  <label className="font-bold text-[#433E37] block mb-1.5">Catégories & Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {PRESET_TAGS.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTag(t)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          selectedTags.includes(t)
                            ? 'bg-[#433E37] text-white'
                            : 'bg-[#FAF8F5] text-[#7D7569] hover:text-[#433E37] border border-[#E6E1D7]'
                        }`}
                      >
                        {selectedTags.includes(t) ? '✓ ' : '+ '}
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Add custom tag */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={handleAddCustomTag}
                      placeholder="Ajouter un tag personnalisé..."
                      className="flex-1 bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl p-2 text-xs text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="px-3 bg-[#F4F1EB] hover:bg-[#EAE5DC] text-[#433E37] font-bold rounded-xl border border-[#E6E1D7] cursor-pointer"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Ingredients List with live amounts */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E6E1D7]">
                <h4 className="font-bold text-[#433E37] text-xs uppercase tracking-wider flex items-center justify-between">
                  <span>2. Ingrédients & Quantités</span>
                  <span className="text-[#A39E93] font-normal normal-case">{ingredientsList.length} ajoutés</span>
                </h4>

                {/* Add ingredient controls */}
                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Catalog search/select */}
                    <div className="flex-1 space-y-1">
                      <input
                        type="text"
                        value={ingredientSearch}
                        onChange={(e) => setIngredientSearch(e.target.value)}
                        placeholder="Filtrer l'ingrédient..."
                        className="w-full bg-white border border-[#DCD6CB] rounded-lg p-1.5 text-xs text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                      />
                      <select
                        value={currentIngId}
                        onChange={(e) => {
                          setCurrentIngId(e.target.value);
                          const chosen = INGREDIENTS[e.target.value];
                          if (chosen) {
                            if (chosen.unit === 'g') setCurrentIngQty(100);
                            else if (chosen.unit === 'ml') setCurrentIngQty(150);
                            else setCurrentIngQty(1);
                          }
                        }}
                        className="w-full bg-white border border-[#DCD6CB] rounded-lg p-2 text-xs font-medium text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                      >
                        {filteredCatalog.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.cat}) — unité : {ing.unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity + unit input */}
                    <div className="flex items-end gap-2 shrink-0">
                      <div>
                        <span className="text-[10px] text-[#7D7569] block mb-0.5">Quantité</span>
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          value={currentIngQty}
                          onChange={(e) => setCurrentIngQty(parseFloat(e.target.value) || 1)}
                          className="w-20 bg-white border border-[#DCD6CB] rounded-lg p-2 font-mono-code font-bold text-[#433E37] text-center focus:outline-none focus:border-[#8BA888]"
                        />
                      </div>
                      <span className="font-mono-code font-bold text-[#7D7569] p-2 bg-[#F4F1EB] rounded-lg border border-[#E6E1D7] text-xs">
                        {currentIngDetails?.unit || 'unité'}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddIngredient}
                        className="px-3.5 py-2 bg-[#8BA888] hover:bg-[#789675] text-white font-bold rounded-lg shrink-0 cursor-pointer shadow-2xs"
                      >
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Ingredients table */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-[#FAF8F5]">
                  {ingredientsList.map((ing, idx) => {
                    const info = INGREDIENTS[ing.id];
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D7]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#8BA888]" />
                          <span className="font-bold text-[#433E37]">{info?.name || ing.id}</span>
                          <span className="text-[#A39E93] text-[10px]">({info?.cat})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono-code font-bold text-[#433E37] bg-white px-2 py-0.5 rounded border border-[#E6E1D7]">
                            {ing.qty} {info?.unit}
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveIngredient(idx)}
                            className="text-[#B84A39] hover:text-[#9A382A] p-1 rounded hover:bg-white cursor-pointer transition-colors"
                            title="Supprimer cet ingrédient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Step-by-Step Preparation Instructions */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E6E1D7]">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#433E37] text-xs uppercase tracking-wider">
                    3. Étapes de Préparation
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="text-xs font-bold text-[#8BA888] hover:text-[#789675] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une étape
                  </button>
                </div>

                <div className="space-y-2">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#433E37] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-2">
                        {idx + 1}
                      </span>
                      <textarea
                        value={step}
                        onChange={(e) => handleUpdateStep(idx, e.target.value)}
                        placeholder={`Étape ${idx + 1} : Ex. Faire dorer les oignons 3 min...`}
                        className="flex-1 bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl p-2 text-xs text-[#433E37] focus:outline-none focus:border-[#8BA888] resize-none h-16"
                        required={idx === 0}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-[#A39E93] hover:text-[#B84A39] p-1.5 mt-2 cursor-pointer"
                        title="Supprimer cette étape"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Nutritional Information (Optional custom or automatic) */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-[#E6E1D7]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#433E37] text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-[#D97706]" />
                      4. Informations Nutritionnelles (Optionnel)
                    </h4>
                    <p className="text-[11px] text-[#7D7569]">
                      Calculées automatiquement via les ingrédients ou personnalisées manuellement.
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-[11px] font-bold text-[#433E37]">
                      {useCustomNutrition ? 'Saisie Manuelle' : 'Calcul Auto'}
                    </span>
                    <input
                      type="checkbox"
                      checked={useCustomNutrition}
                      onChange={(e) => setUseCustomNutrition(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#DCD6CB] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DCD6CB] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#8BA888] relative"></div>
                  </label>
                </div>

                {/* Auto Calculated Live Preview */}
                {!useCustomNutrition ? (
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#7D7569]">
                        Valeurs estimées à partir des ingrédients choisis :
                      </span>
                      <span className="font-mono-code font-bold text-[#3D593A] bg-[#EBF2EA] px-2 py-0.5 rounded border border-[#D1E0CE]">
                        Nutri-Score {liveNutrition.nutriScore}
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono-code">
                      <div className="p-2 bg-white rounded-lg border border-[#E6E1D7]">
                        <span className="text-[10px] text-[#A39E93] block">Calories</span>
                        <span className="font-bold text-[#D97706]">{liveNutrition.calories} kcal</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#E6E1D7]">
                        <span className="text-[10px] text-[#A39E93] block">Protéines</span>
                        <span className="font-bold text-[#3D593A]">{liveNutrition.proteins}g</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#E6E1D7]">
                        <span className="text-[10px] text-[#A39E93] block">Glucides</span>
                        <span className="font-bold text-[#7D7569]">{liveNutrition.carbs}g</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#E6E1D7]">
                        <span className="text-[10px] text-[#A39E93] block">Lipides</span>
                        <span className="font-bold text-[#433E37]">{liveNutrition.fats}g</span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-[#E6E1D7]">
                        <span className="text-[10px] text-[#A39E93] block">Fibres</span>
                        <span className="font-bold text-[#3D593A]">{liveNutrition.fiber}g</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#FDF6EE] rounded-xl border border-[#FAD7A0] space-y-3">
                    <p className="text-[11px] text-[#9A5304] font-medium">
                      Tu peux spécifier des valeurs nutritionnelles personnalisées par portion :
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-[#433E37] block mb-1">Calories (kcal)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={customCalories}
                          onChange={(e) => setCustomCalories(e.target.value)}
                          placeholder="ex: 450"
                          className="w-full bg-white border border-[#FAD7A0] rounded-lg p-2 font-mono-code font-bold text-center text-[#D97706] focus:outline-none focus:border-[#8BA888]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#433E37] block mb-1">Protéines (g)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={customProteins}
                          onChange={(e) => setCustomProteins(e.target.value)}
                          placeholder="ex: 22"
                          className="w-full bg-white border border-[#FAD7A0] rounded-lg p-2 font-mono-code font-bold text-center text-[#3D593A] focus:outline-none focus:border-[#8BA888]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#433E37] block mb-1">Glucides (g)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={customCarbs}
                          onChange={(e) => setCustomCarbs(e.target.value)}
                          placeholder="ex: 55"
                          className="w-full bg-white border border-[#FAD7A0] rounded-lg p-2 font-mono-code font-bold text-center text-[#7D7569] focus:outline-none focus:border-[#8BA888]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#433E37] block mb-1">Lipides (g)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={customFats}
                          onChange={(e) => setCustomFats(e.target.value)}
                          placeholder="ex: 14"
                          className="w-full bg-white border border-[#FAD7A0] rounded-lg p-2 font-mono-code font-bold text-center text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#433E37] block mb-1">Fibres (g)</label>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={customFiber}
                          onChange={(e) => setCustomFiber(e.target.value)}
                          placeholder="ex: 6"
                          className="w-full bg-white border border-[#FAD7A0] rounded-lg p-2 font-mono-code font-bold text-center text-[#3D593A] focus:outline-none focus:border-[#8BA888]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-[#F4F1EB] hover:bg-[#EAE5DC] text-[#7D7569] hover:text-[#433E37] font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#433E37] hover:bg-[#322E28] text-white font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4 text-[#8BA888]" />
                  <span>{editingRecipe ? 'Enregistrer les modifications' : 'Créer et enregistrer la recette'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-[#FDF6EE] rounded-xl border border-[#FAD7A0] text-[#9A5304] space-y-2 leading-relaxed">
                <p className="font-bold text-sm">
                  🤖 Importer n'importe quelle recette du web ou de ton IA :
                </p>
                <p className="text-[11px]">
                  Demande à ChatGPT, Claude ou Gemini de convertir ta recette selon le schéma suivant :
                </p>
                <pre className="p-3 bg-white rounded-lg border border-[#FAD7A0] text-[10px] font-mono-code text-[#433E37] whitespace-pre-wrap overflow-x-auto leading-relaxed">
{`{
  "name": "Pâtes au thon citronné",
  "type": "soir", // "midi" ou "soir"
  "time": "12 min · 1 poêle",
  "tags": ["Rapide", "Protéiné", "Économique"],
  "ingredients": [
    {"id": "pates", "qty": 100},
    {"id": "thon", "qty": 0.5},
    {"id": "creme", "qty": 30},
    {"id": "citron", "qty": 0.5}
  ],
  "steps": [
    "Cuire les pâtes al dente dans de l'eau salée.",
    "Égoutter puis ajouter la crème, le thon émietté et un filet de jus de citron.",
    "Poivrer et servir chaud."
  ],
  "customNutrition": {
    "calories": 460,
    "proteins": 26,
    "carbs": 62,
    "fats": 11,
    "fiber": 4
  }
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#433E37]">Code JSON de la recette :</label>
                  <button
                    type="button"
                    onClick={handlePasteClipboard}
                    className="text-[#D97706] hover:text-[#B45309] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Coller du presse-papiers
                  </button>
                </div>
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  placeholder='Colle ici ton code JSON...'
                  className="w-full h-36 bg-white border border-[#DCD6CB] rounded-xl p-3 font-mono-code text-[11px] text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                />
              </div>

              <button
                type="button"
                onClick={handleImportJson}
                className="w-full py-3 bg-[#8BA888] hover:bg-[#789675] text-white font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4" />
                <span>Importer la recette dans mon livre</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

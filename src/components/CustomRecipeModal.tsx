import React, { useEffect, useMemo, useState } from 'react';
import { INGREDIENTS } from '../data/ingredients';
import { MealType, NutritionalValues, Recipe, RecipeIngredient } from '../types';
import {
  generateAiRecipePrompt,
  getGroupedIngredients,
  parseAndValidateAiRecipe,
  ParseAiRecipeResult
} from '../utils/aiRecipePrompt';
import { calculateDishNutrition } from '../utils/nutrition';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clipboard,
  ClipboardPaste,
  Copy,
  Eye,
  Flame,
  HelpCircle,
  Info,
  Lightbulb,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Wand2,
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

const EXAMPLE_AI_JSON = `{
  "name": "Tagliatelles crémeuses au poulet & champignons",
  "type": "soir",
  "time": "12 min · 1 poêle",
  "tags": ["Poulet", "Crémeux", "Express", "Protéiné"],
  "ingredients": [
    { "id": "pates", "qty": 90 },
    { "id": "poulet", "qty": 110 },
    { "id": "champignon", "qty": 70 },
    { "id": "creme", "qty": 35 },
    { "id": "beurre", "qty": 10 }
  ],
  "steps": [
    "Cuire les pâtes al dente dans une casserole d'eau bouillante salée.",
    "Faire dorer le poulet émincé et les champignons émincés dans une poêle avec le beurre pendant 6 min.",
    "Verser la crème fraîche, assaisonner de sel et poivre, et laisser réduire à feu doux 2 min.",
    "Égoutter les pâtes et les mélanger directement dans la poêle pour bien napper."
  ],
  "customNutrition": {
    "calories": 540,
    "proteins": 36,
    "carbs": 64,
    "fats": 15,
    "fiber": 4
  }
}`;

export const CustomRecipeModal: React.FC<CustomRecipeModalProps> = ({
  isOpen,
  editingRecipe,
  onClose,
  onSaveRecipe,
  onUpdateRecipe
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual' | 'dictionary'>('ai');

  // ==========================================
  // AI Generator & Importer State
  // ==========================================
  const [aiMealType, setAiMealType] = useState<MealType | 'any'>('any');
  const [aiDietPref, setAiDietPref] = useState<'all' | 'veggie' | 'protein' | 'quick' | 'budget' | 'comfort'>('all');
  const [aiDishIdea, setAiDishIdea] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showRawPrompt, setShowRawPrompt] = useState(false);
  const [jsonInputText, setJsonInputText] = useState('');
  const [aiParseResult, setAiParseResult] = useState<ParseAiRecipeResult | null>(null);

  // ==========================================
  // Dictionary Explorer State
  // ==========================================
  const [dictSearch, setDictSearch] = useState('');
  const [dictCategoryFilter, setDictCategoryFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ==========================================
  // Manual Form State
  // ==========================================
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

  // Sync with editingRecipe when opened
  useEffect(() => {
    if (isOpen) {
      if (editingRecipe) {
        setActiveTab('manual');
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
        setActiveTab('ai');
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
        setJsonInputText('');
        setAiParseResult(null);
        setAiDishIdea('');
        setCopiedPrompt(false);
      }
    }
  }, [isOpen, editingRecipe]);

  // Live generated AI prompt text based on current options
  const generatedAiPrompt = useMemo(() => {
    return generateAiRecipePrompt({
      dishIdea: aiDishIdea.trim() || undefined,
      mealType: aiMealType,
      dietPreference: aiDietPref
    });
  }, [aiDishIdea, aiMealType, aiDietPref]);

  // Live auto-calculated nutrition summary for manual creation
  const livePreviewRecipe: Recipe = useMemo(() => {
    return {
      id: 'temp_preview',
      name: name || 'Aperçu',
      type,
      time,
      steps: steps.filter((s) => s.trim().length > 0),
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
  }, [
    name,
    type,
    time,
    steps,
    ingredientsList,
    selectedTags,
    useCustomNutrition,
    customCalories,
    customProteins,
    customCarbs,
    customFats,
    customFiber
  ]);

  const liveNutrition = useMemo(() => {
    return calculateDishNutrition(livePreviewRecipe);
  }, [livePreviewRecipe]);

  // Grouped ingredients for dictionary
  const groupedIngredients = useMemo(() => {
    return getGroupedIngredients();
  }, []);

  const allCategories = useMemo(() => {
    return ['all', ...groupedIngredients.map((g) => g.category)];
  }, [groupedIngredients]);

  const filteredDictionaryItems = useMemo(() => {
    const query = dictSearch.toLowerCase().trim();
    let flatItems: { id: string; name: string; unit: string; typicalQty: string; category: string }[] = [];

    groupedIngredients.forEach((g) => {
      if (dictCategoryFilter === 'all' || dictCategoryFilter === g.category) {
        g.items.forEach((item) => {
          if (
            !query ||
            item.name.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query) ||
            g.category.toLowerCase().includes(query)
          ) {
            flatItems.push({ ...item, category: g.category });
          }
        });
      }
    });

    return flatItems;
  }, [groupedIngredients, dictSearch, dictCategoryFilter]);

  if (!isOpen) return null;

  // Filtered ingredients catalog for manual select dropdown
  const filteredCatalog = Object.values(INGREDIENTS)
    .filter((ing) =>
      ingredientSearch
        ? ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
          ing.cat.toLowerCase().includes(ingredientSearch.toLowerCase()) ||
          ing.id.toLowerCase().includes(ingredientSearch.toLowerCase())
        : true
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(generatedAiPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3000);
    } catch (e) {
      alert('Presse-papiers non disponible, veuillez sélectionner et copier le texte manuellement.');
    }
  };

  const handleCopySingleId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      // ignore
    }
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInputText(text);
      // Auto-validate immediately on paste
      const res = parseAndValidateAiRecipe(text);
      setAiParseResult(res);
    } catch (e) {
      alert('Impossible d’accéder au presse-papiers. Veuillez coller le texte manuellement dans le champ.');
    }
  };

  const handleAnalyzeJson = () => {
    const res = parseAndValidateAiRecipe(jsonInputText);
    setAiParseResult(res);
  };

  const handleLoadExampleJson = () => {
    setJsonInputText(EXAMPLE_AI_JSON);
    const res = parseAndValidateAiRecipe(EXAMPLE_AI_JSON);
    setAiParseResult(res);
  };

  const handleConfirmAiImport = () => {
    if (!aiParseResult || !aiParseResult.success || !aiParseResult.recipe) {
      alert('Veuillez d’abord analyser et valider une recette JSON valide.');
      return;
    }

    const rec = aiParseResult.recipe;
    if (editingRecipe && onUpdateRecipe) {
      onUpdateRecipe(rec.type, rec);
    } else {
      onSaveRecipe(rec.type, rec);
    }

    onClose();
  };

  // Manual actions
  const handleAddIngredient = () => {
    if (!currentIngId || currentIngQty <= 0) return;
    setIngredientsList((prev) => [...prev, { id: currentIngId, qty: currentIngQty }]);
    setCurrentIngQty(1);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredientsList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setSteps((prev) => [...prev, '']);
  };

  const handleUpdateStep = (index: number, val: string) => {
    setSteps((prev) => {
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
    setSteps((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newTagInput.trim()) {
      const formatted = newTagInput.trim();
      if (!selectedTags.includes(formatted)) {
        setSelectedTags((prev) => [...prev, formatted]);
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
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

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

  const currentIngDetails = INGREDIENTS[currentIngId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#433E37]/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border border-[#DCD6CB] w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E6E1D7] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#D97706] shadow-2xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono-code font-bold uppercase tracking-wider text-[#D97706] block">
                {editingRecipe ? 'Édition de recette' : 'Création de recette étudiante'}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[#433E37] leading-tight">
                {editingRecipe ? `Modifier : ${editingRecipe.name}` : 'Ajouter ou Générer une Nouvelle Recette'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#A39E93] hover:text-[#433E37] hover:bg-[#F4F1EB] rounded-xl transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="p-2.5 bg-[#F4F1EB] border-b border-[#E6E1D7] flex flex-wrap justify-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-[#8BA888] text-white shadow-2xs scale-[1.02]'
                : 'text-[#7D7569] hover:text-[#433E37] hover:bg-white/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>🤖 Mode Automatique IA & Import</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white text-[#433E37] shadow-2xs border border-[#E6E1D7] scale-[1.02]'
                : 'text-[#7D7569] hover:text-[#433E37] hover:bg-white/60'
            }`}
          >
            <span>✍️ Saisie Manuelle</span>
          </button>

          <button
            onClick={() => setActiveTab('dictionary')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dictionary'
                ? 'bg-[#433E37] text-white shadow-2xs scale-[1.02]'
                : 'text-[#7D7569] hover:text-[#433E37] hover:bg-white/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📖 Dictionnaire Ingrédients ({Object.keys(INGREDIENTS).length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* ============================================================== */}
          {/* TAB 1: AI GENERATOR & JSON IMPORT */}
          {/* ============================================================== */}
          {activeTab === 'ai' && (
            <div className="space-y-6 text-xs">
              {/* Step 1: Prompt Generator Box */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D7] shadow-2xs space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#8BA888] text-white font-bold flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <h4 className="font-bold text-sm text-[#433E37]">
                        Générateur de Prompt IA (Garanti 100% Compatible)
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#7D7569] leading-relaxed">
                      Ce prompt fournit automatiquement à ChatGPT, Claude ou Gemini les{' '}
                      <strong className="text-[#433E37]">
                        {Object.keys(INGREDIENTS).length} identifiants d'ingrédients exacts
                      </strong>{' '}
                      et les contraintes pour que le calcul des prix, des courses et des calories fonctionne sans accroc.
                    </p>
                  </div>
                </div>

                {/* Interactive Prompt Configurator */}
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] space-y-3">
                  <div>
                    <label className="font-bold text-[#433E37] block mb-1">
                      Idée ou envie de plat (Optionnel) :
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiDishIdea}
                        onChange={(e) => setAiDishIdea(e.target.value)}
                        placeholder="Ex : Risotto crémeux au poulet et poireaux, Bowl tex-mex haricots maïs..."
                        className="flex-1 bg-white border border-[#DCD6CB] rounded-xl p-2 text-xs text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                      />
                      {aiDishIdea && (
                        <button
                          type="button"
                          onClick={() => setAiDishIdea('')}
                          className="px-2.5 bg-white hover:bg-[#F4F1EB] text-[#A39E93] hover:text-[#433E37] rounded-xl border border-[#E6E1D7] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Fast Quick Filter Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#7D7569] uppercase tracking-wider block">
                      Style & Contraintes rapides :
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'all', label: '✨ Standard' },
                        { id: 'protein', label: '🍗 Riche en protéines' },
                        { id: 'veggie', label: '🌱 100% Végétarien' },
                        { id: 'quick', label: '⚡ Ultra-rapide < 10 min' },
                        { id: 'budget', label: '💰 Budget mini < 1.50€' },
                        { id: 'comfort', label: '🧀 Réconfort & Gourmand' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setAiDietPref(item.id as any)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            aiDietPref === item.id
                              ? 'bg-[#433E37] text-white shadow-2xs'
                              : 'bg-white text-[#7D7569] hover:text-[#433E37] border border-[#E6E1D7]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Meal type selector */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold text-[#7D7569]">Moment :</span>
                    {[
                      { id: 'any', label: 'Indifférent' },
                      { id: 'midi', label: '☀️ Midi' },
                      { id: 'soir', label: '🌙 Soir' }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setAiMealType(m.id as any)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          aiMealType === m.id
                            ? 'bg-[#8BA888] text-white shadow-2xs'
                            : 'bg-white text-[#7D7569] border border-[#E6E1D7]'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Big Copy Action Banner */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      copiedPrompt
                        ? 'bg-[#3D593A] text-white'
                        : 'bg-[#433E37] hover:bg-[#322E28] text-white active:scale-98'
                    }`}
                  >
                    {copiedPrompt ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#8BA888]" />
                        <span>✓ Prompt complet copié ! Colle-le dans ChatGPT / Claude</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-4 h-4 text-[#8BA888]" />
                        <span>Copier le Prompt Complet (avec les {Object.keys(INGREDIENTS).length} ingrédients)</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRawPrompt(!showRawPrompt)}
                    className="px-3.5 py-2.5 bg-[#FAF8F5] hover:bg-[#F4F1EB] text-[#7D7569] hover:text-[#433E37] rounded-xl border border-[#E6E1D7] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{showRawPrompt ? 'Masquer texte' : 'Inspecter texte'}</span>
                    {showRawPrompt ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Collapsible raw prompt view */}
                {showRawPrompt && (
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E6E1D7] space-y-2">
                    <span className="text-[10px] font-mono-code font-bold text-[#7D7569] uppercase block">
                      Aperçu exact du prompt envoyé à l'IA :
                    </span>
                    <pre className="p-3 bg-white rounded-lg border border-[#E6E1D7] text-[10px] font-mono-code text-[#433E37] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {generatedAiPrompt}
                    </pre>
                  </div>
                )}
              </div>

              {/* Step 2: JSON Input & Smart Validation */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E1D7] shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#D97706] text-white font-bold flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <h4 className="font-bold text-sm text-[#433E37]">
                      Coller & Analyser le JSON de l'IA
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadExampleJson}
                      className="text-xs font-semibold text-[#8BA888] hover:text-[#789675] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Exemple de test</span>
                    </button>
                    <span className="text-[#DCD6CB]">|</span>
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="text-xs font-bold text-[#D97706] hover:text-[#B45309] flex items-center gap-1 cursor-pointer"
                    >
                      <ClipboardPaste className="w-3.5 h-3.5" />
                      <span>Coller</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <textarea
                    value={jsonInputText}
                    onChange={(e) => {
                      setJsonInputText(e.target.value);
                      if (aiParseResult) setAiParseResult(null);
                    }}
                    placeholder={`Colle ici le résultat JSON retourné par l'IA...\nExemple :\n{\n  "name": "Tagliatelles au poulet...",\n  "ingredients": [{ "id": "poulet", "qty": 110 }, { "id": "pates", "qty": 90 }],\n  "steps": ["..."]\n}`}
                    className="w-full h-32 bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl p-3 font-mono-code text-[11px] text-[#433E37] focus:outline-none focus:border-[#8BA888] resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAnalyzeJson}
                      disabled={!jsonInputText.trim()}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        jsonInputText.trim()
                          ? 'bg-[#8BA888] hover:bg-[#789675] text-white shadow-2xs'
                          : 'bg-[#E6E1D7] text-[#A39E93] cursor-not-allowed'
                      }`}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Analyser & Vérifier la Recette</span>
                    </button>
                  </div>
                </div>

                {/* Analysis Report Display */}
                {aiParseResult && (
                  <div
                    className={`p-4 rounded-xl border space-y-4 animate-in fade-in duration-150 ${
                      aiParseResult.success
                        ? 'bg-[#F4F9F4] border-[#D1E0CE]'
                        : 'bg-[#FDF2F0] border-[#F5C6CB]'
                    }`}
                  >
                    {/* Status header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {aiParseResult.success ? (
                          <div className="w-6 h-6 rounded-full bg-[#8BA888] text-white flex items-center justify-center">
                            <Check className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#B84A39] text-white flex items-center justify-center">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <h5 className="font-bold text-sm text-[#433E37]">
                            {aiParseResult.success
                              ? `Recette validée : "${aiParseResult.recipe?.name}"`
                              : 'Erreurs de validation du JSON'}
                          </h5>
                          <span className="text-[11px] text-[#7D7569]">
                            {aiParseResult.success
                              ? `${aiParseResult.resolvedIngredients.length} ingrédient(s) reconnus avec succès · ${aiParseResult.recipe?.time}`
                              : 'Vérifie les messages d’erreur ci-dessous.'}
                          </span>
                        </div>
                      </div>
                      {aiParseResult.success && aiParseResult.recipe && (
                        <span className="font-mono-code font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-[#D1E0CE] text-[#3D593A]">
                          Nutri-Score {calculateDishNutrition(aiParseResult.recipe).nutriScore}
                        </span>
                      )}
                    </div>

                    {/* Warnings or errors list */}
                    {aiParseResult.errors.length > 0 && (
                      <div className="p-3 bg-white rounded-lg border border-[#F5C6CB] text-[#B84A39] space-y-1">
                        {aiParseResult.errors.map((err, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{err}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {aiParseResult.warnings.length > 0 && (
                      <div className="p-2.5 bg-white/80 rounded-lg border border-[#E6E1D7] text-[#9A5304] space-y-1 text-[11px]">
                        <span className="font-bold block">💡 Ajustements automatiques effectués :</span>
                        {aiParseResult.warnings.map((w, i) => (
                          <div key={i} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Validated Ingredients Pill Matrix */}
                    {aiParseResult.success && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-[#433E37] block">
                          Ingrédients mappés dans l'application :
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {aiParseResult.resolvedIngredients.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2 bg-white rounded-lg border border-[#D1E0CE] flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#8BA888]" />
                                <span className="font-bold text-[#433E37]">{item.resolvedName}</span>
                                <code className="text-[10px] text-[#A39E93]">({item.resolvedId})</code>
                              </div>
                              <span className="font-mono-code font-bold text-[#3D593A]">
                                {item.qty} {item.unit}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Nutrition pill preview */}
                        {aiParseResult.recipe && (
                          <div className="pt-2">
                            {(() => {
                              const nut = calculateDishNutrition(aiParseResult.recipe!);
                              return (
                                <div className="grid grid-cols-5 gap-1.5 text-center font-mono-code text-[11px]">
                                  <div className="p-1.5 bg-white rounded border border-[#D1E0CE]">
                                    <span className="text-[9px] text-[#A39E93] block">Calories</span>
                                    <span className="font-bold text-[#D97706]">{nut.calories} kcal</span>
                                  </div>
                                  <div className="p-1.5 bg-white rounded border border-[#D1E0CE]">
                                    <span className="text-[9px] text-[#A39E93] block">Protéines</span>
                                    <span className="font-bold text-[#3D593A]">{nut.proteins}g</span>
                                  </div>
                                  <div className="p-1.5 bg-white rounded border border-[#D1E0CE]">
                                    <span className="text-[9px] text-[#A39E93] block">Glucides</span>
                                    <span className="font-bold text-[#7D7569]">{nut.carbs}g</span>
                                  </div>
                                  <div className="p-1.5 bg-white rounded border border-[#D1E0CE]">
                                    <span className="text-[9px] text-[#A39E93] block">Lipides</span>
                                    <span className="font-bold text-[#433E37]">{nut.fats}g</span>
                                  </div>
                                  <div className="p-1.5 bg-white rounded border border-[#D1E0CE]">
                                    <span className="text-[9px] text-[#A39E93] block">Fibres</span>
                                    <span className="font-bold text-[#3D593A]">{nut.fiber}g</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}

                        {/* Confirm Button */}
                        <div className="pt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={handleConfirmAiImport}
                            className="w-full sm:w-auto px-6 py-3 bg-[#433E37] hover:bg-[#322E28] text-white font-bold rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4 text-[#8BA888]" />
                            <span>Enregistrer cette recette dans mon carnet</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MANUAL FORM CREATION */}
          {/* ============================================================== */}
          {activeTab === 'manual' && (
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
                    {PRESET_TAGS.map((t) => (
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
                        {filteredCatalog.map((ing) => (
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
                            onClick={() => handleRemoveIngredient(idx)}
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

              {/* 4. Nutritional Information */}
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
          )}

          {/* ============================================================== */}
          {/* TAB 3: INGREDIENTS DICTIONARY & VARIABLES EXPLORER */}
          {/* ============================================================== */}
          {activeTab === 'dictionary' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-white rounded-xl border border-[#E6E1D7] space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[#433E37] flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#8BA888]" />
                      <span>Dictionnaire des Ingrédients & Identifiants Fixes</span>
                    </h4>
                    <p className="text-[11px] text-[#7D7569] mt-0.5">
                      Voici la liste complète des {Object.keys(INGREDIENTS).length} ingrédients reconnus par l'application. Clique sur un identifiant pour le copier.
                    </p>
                  </div>
                </div>

                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#A39E93]" />
                    <input
                      type="text"
                      value={dictSearch}
                      onChange={(e) => setDictSearch(e.target.value)}
                      placeholder="Rechercher par nom d'ingrédient ou identifiant..."
                      className="w-full pl-8 pr-3 py-2 bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl text-xs text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                    />
                  </div>

                  <select
                    value={dictCategoryFilter}
                    onChange={(e) => setDictCategoryFilter(e.target.value)}
                    className="bg-[#FAF8F5] border border-[#DCD6CB] rounded-xl px-3 py-2 text-xs font-semibold text-[#433E37] focus:outline-none focus:border-[#8BA888]"
                  >
                    <option value="all">Toutes les catégories</option>
                    {groupedIngredients.map((g) => (
                      <option key={g.category} value={g.category}>
                        {g.category} ({g.items.length})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto p-1">
                {filteredDictionaryItems.map((item) => {
                  const ing = INGREDIENTS[item.id];
                  const isCopied = copiedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-xl border border-[#E6E1D7] hover:border-[#8BA888] transition-colors flex flex-col justify-between gap-2 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-semibold text-[#A39E93] uppercase">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-mono-code font-bold text-[#8BA888] bg-[#F4F9F4] px-1.5 py-0.5 rounded">
                            Unité: {item.unit}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-[#433E37] leading-tight">
                          {item.name}
                        </h5>
                        <p className="text-[10px] text-[#7D7569] mt-0.5">
                          Portion typique : {item.typicalQty}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#FAF8F5] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => handleCopySingleId(item.id)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-mono-code font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            isCopied
                              ? 'bg-[#3D593A] text-white'
                              : 'bg-[#FAF8F5] hover:bg-[#F4F1EB] text-[#433E37] border border-[#DCD6CB]'
                          }`}
                          title="Copier cet identifiant exact"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-[#8BA888]" />
                              <span>Copié !</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#A39E93]" />
                              <span>"{item.id}"</span>
                            </>
                          )}
                        </button>

                        {ing?.nutritionPer100 && (
                          <span className="text-[10px] font-mono-code text-[#A39E93]">
                            {ing.nutritionPer100.calories} kcal/100g
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

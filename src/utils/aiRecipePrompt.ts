import { INGREDIENTS } from '../data/ingredients';
import { MealType, NutritionalValues, Recipe, RecipeIngredient } from '../types';

export interface AiPromptOptions {
  dishIdea?: string;
  mealType?: MealType | 'any';
  dietPreference?: 'all' | 'veggie' | 'protein' | 'quick' | 'budget' | 'comfort';
  customIngredients?: string[];
  maxMinutes?: number;
}

// Grouped ingredients for clear LLM reference
export interface IngredientCategorySummary {
  category: string;
  items: {
    id: string;
    name: string;
    unit: string;
    typicalQty: string;
  }[];
}

export function getGroupedIngredients(): IngredientCategorySummary[] {
  const categories: Record<string, { id: string; name: string; unit: string; typicalQty: string }[]> = {};

  Object.values(INGREDIENTS).forEach((ing) => {
    const cat = ing.cat || 'Autre';
    if (!categories[cat]) {
      categories[cat] = [];
    }

    let typicalQty = '1 portion';
    if (ing.unit === 'g') {
      if (['pates', 'riz', 'semoule', 'couscous', 'lentilles', 'gnocchi', 'patate_douce', 'pdt'].includes(ing.id)) {
        typicalQty = '80 - 100 g';
      } else if (['poulet', 'viande', 'saumon', 'saumon_fume', 'crevettes', 'gesiers', 'tofu', 'falafel'].includes(ing.id)) {
        typicalQty = '90 - 120 g';
      } else if (['lardons', 'chorizo', 'parmesan', 'fromage', 'feta', 'chevre', 'creme', 'beurre'].includes(ing.id)) {
        typicalQty = '15 - 40 g';
      } else if (['carotte', 'champignon', 'epinard', 'legsurg', 'pdt_surg'].includes(ing.id)) {
        typicalQty = '80 - 150 g';
      } else {
        typicalQty = '3 - 25 g';
      }
    } else if (ing.unit === 'ml') {
      typicalQty = ing.id === 'lait' ? '50 - 150 ml' : ing.id === 'laitcoco' ? '60 - 100 ml' : '10 - 20 ml';
    } else if (ing.unit === 'pièce' || ing.unit === 'boîte' || ing.unit === 'tranche' || ing.unit === 'cube' || ing.unit === 'gousse' || ing.unit === 'sachet' || ing.unit === 'baguette') {
      if (['oeuf', 'jambon', 'bacon', 'cheddar', 'saucisse', 'knacki', 'poisson_pane', 'cordon_bleu', 'steak_hache', 'wrap', 'painmie', 'pain_burger'].includes(ing.id)) {
        typicalQty = '1 - 2 ' + ing.unit;
      } else if (['thon', 'poischiches', 'haricots', 'haricots_blancs', 'mais', 'tomboite', 'sardines'].includes(ing.id)) {
        typicalQty = '0.5 - 1 ' + ing.unit;
      } else if (['oignon', 'courgette', 'poivron', 'tomate', 'concombre', 'avocat', 'citron', 'pomme', 'poire', 'banane', 'salade'].includes(ing.id)) {
        typicalQty = '0.3 - 1 ' + ing.unit;
      } else {
        typicalQty = '1 ' + ing.unit;
      }
    }

    categories[cat].push({
      id: ing.id,
      name: ing.name,
      unit: ing.unit,
      typicalQty
    });
  });

  return Object.entries(categories).map(([category, items]) => ({
    category,
    items: items.sort((a, b) => a.name.localeCompare(b.name))
  }));
}

// Generate the ultimate structured copyable prompt for external LLMs
export function generateAiRecipePrompt(options: AiPromptOptions = {}): string {
  const grouped = getGroupedIngredients();

  let formattedCatalog = '';
  grouped.forEach((g) => {
    formattedCatalog += `\n### ${g.category.toUpperCase()}\n`;
    g.items.forEach((item) => {
      formattedCatalog += `- \`"${item.id}"\` : ${item.name} (unité: ${item.unit} | typique: ${item.typicalQty})\n`;
    });
  });

  const mealTypeDirective =
    options.mealType === 'midi'
      ? 'Créer une recette rapide et facile pour le MIDI (déjeuner sur le pouce ou emportable).'
      : options.mealType === 'soir'
      ? 'Créer une recette réconfortante et équilibrée pour le SOIR (dîner complet).'
      : 'Créer une recette adaptée pour étudiant (midi ou soir selon le plat).';

  let specificWish = options.dishIdea ? `Idée ou envie utilisateur : "${options.dishIdea}"` : 'Idée : une recette originale, savoureuse et rapide pour étudiant.';

  if (options.dietPreference === 'veggie') {
    specificWish += ' (Régime 100% végétarien, sans viande ni poisson).';
  } else if (options.dietPreference === 'protein') {
    specificWish += ' (Riche en protéines pour sportif/étudiant actif).';
  } else if (options.dietPreference === 'quick') {
    specificWish += ' (Ultra-rapide, prête en moins de 10-12 minutes).';
  } else if (options.dietPreference === 'budget') {
    specificWish += ' (Ultra-économique, moins de 1.50€ par portion).';
  } else if (options.dietPreference === 'comfort') {
    specificWish += ' (Très réconfortant et généreux).';
  }

  if (options.customIngredients && options.customIngredients.length > 0) {
    specificWish += ` Ingrédients souhaités en priorité : ${options.customIngredients.join(', ')}.`;
  }

  return `Tu es le chef cuisinier et nutritionniste expert de l'application étudiante de planification de repas.
Ton rôle est de générer une recette simple, économique et délicieuse pour 1 personne (1 portion étudiante).

${mealTypeDirective}
${specificWish}

═══════════════════════════════════════════════════════════════════════
⚠️ RÈGLE CRUCIALE NON NÉGOCIABLE SUR LES INGRÉDIENTS (IMPORTANT !) :
Pour que l'application calcule automatiquement les coûts, la liste de courses et la nutrition,
tu DOIS OBLIGATOIREMENT ET STRICTEMENT utiliser UNIQUEMENT les identifiants \`id\` exacts de la liste ci-dessous.
Ne crée AUCUN identifiant inventé (ex: n'utilise PAS "olive_oil", "chicken", "pasta" mais "poulet", "pates", etc.).
═══════════════════════════════════════════════════════════════════════

LISTE DES IDENTIFIANTS D'INGRÉDIENTS AUTORISÉS DANS L'APPLICATION :
${formattedCatalog}

═══════════════════════════════════════════════════════════════════════
FORMAT DE RÉPONSE STRICT :
Réponds UNIQUEMENT par un objet JSON valide (sans texte explicatif avant ou après, sans backticks markdown superflus si possible).

SCHEMA JSON ATTENDU :
{
  "name": "Nom gourmand et précis du plat (ex: Tagliatelles au poulet crémeux & champignons)",
  "type": "${options.mealType === 'midi' ? 'midi' : options.mealType === 'soir' ? 'soir' : 'soir'}",
  "time": "12 min · 1 poêle",
  "tags": ["Poulet", "Crémeux", "Express"],
  "ingredients": [
    { "id": "pates", "qty": 90 },
    { "id": "poulet", "qty": 110 },
    { "id": "champignon", "qty": 70 },
    { "id": "creme", "qty": 30 },
    { "id": "beurre", "qty": 10 }
  ],
  "steps": [
    "Faire cuire les pâtes dans une casserole d'eau bouillante salée.",
    "Faire dorer le poulet émincé et les champignons à la poêle 6 min dans le beurre.",
    "Ajouter la crème fraîche, poivrer et laisser mijoter 2 min.",
    "Égoutter les pâtes et mélanger directement dans la poêle."
  ],
  "customNutrition": {
    "calories": 520,
    "proteins": 34,
    "carbs": 65,
    "fats": 14,
    "fiber": 4
  }
}

Rappels importants :
- 1 seule portion étudiante.
- Les étapes de préparation doivent être concises, claires et rédigées à l'infinitif ou au tutoiement bienveillant.
- Respecter scrupuleusement les unités de chaque ingrédient (\`g\` pour grammes, \`ml\` pour millilitres, \`pièce\` ou \`tranche\` ou \`boîte\` pour les unités).`;
}

// Alias dictionary to intelligently map loose AI identifiers or French terms to exact app IDs
const ALIAS_MAP: Record<string, string> = {
  // Pâtes & Féculents
  pasta: 'pates',
  pate: 'pates',
  tagliatelles: 'pates',
  spaghetti: 'pates',
  spaghettis: 'pates',
  penne: 'pates',
  coquillette: 'pates',
  coquillettes: 'pates',
  macaroni: 'pates',
  rice: 'riz',
  riz_blanc: 'riz',
  riz_basmati: 'riz',
  semolina: 'semoule',
  semoule_fine: 'semoule',
  couscous_moyen: 'couscous',
  ramen: 'nouilles',
  noodles: 'nouilles',
  nouille: 'nouilles',
  gnocchis: 'gnocchi',
  gnocchis_a_poeler: 'gnocchi',
  patates: 'pdt',
  pomme_de_terre: 'pdt',
  pommes_de_terre: 'pdt',
  pomme_de_terre_fraiche: 'pdt',
  patate: 'pdt',
  sweet_potato: 'patate_douce',
  patatedouce: 'patate_douce',

  // Viandes & Volailles
  chicken: 'poulet',
  filet_de_poulet: 'poulet',
  escalope_poulet: 'poulet',
  blanc_de_poulet: 'poulet',
  escalope: 'poulet',
  poulet_filet: 'poulet',
  viande_hachee: 'viande',
  steak: 'steak_hache',
  steakhache: 'steak_hache',
  ground_beef: 'viande',
  beef: 'viande',
  boeuf: 'viande',
  bacon_tranches: 'bacon',
  lardon: 'lardons',
  lardon_fume: 'lardons',
  saucisses: 'saucisse',
  saucisse_toulouse: 'saucisse',
  saucisse_knacki: 'knacki',
  knackis: 'knacki',
  gesier: 'gesiers',
  gesiers_confits: 'gesiers',
  jambon_blanc: 'jambon',
  ham: 'jambon',
  cordonbleu: 'cordon_bleu',

  // Poissons & Fruits de mer
  salmon: 'saumon',
  pave_saumon: 'saumon',
  saumon_frais: 'saumon',
  smoked_salmon: 'saumon_fume',
  saumonfume: 'saumon_fume',
  tuna: 'thon',
  thon_boite: 'thon',
  thon_naturel: 'thon',
  shrimp: 'crevettes',
  crevette: 'crevettes',
  crevettes_cuites: 'crevettes',
  poisson: 'poisson_pane',
  poissonpane: 'poisson_pane',
  sardine: 'sardines',

  // Produits laitiers & Fromages
  milk: 'lait',
  butter: 'beurre',
  beurre_doux: 'beurre',
  cream: 'creme',
  creme_fraiche: 'creme',
  cremefraiche: 'creme',
  egg: 'oeuf',
  eggs: 'oeuf',
  oeufs: 'oeuf',
  cheese: 'fromage',
  emmental: 'fromage',
  emmental_rape: 'fromage',
  gruyere: 'fromage',
  fromage_rape: 'fromage',
  parmigiano: 'parmesan',
  grana_padano: 'parmesan',
  chevre_buche: 'chevre',
  goat_cheese: 'chevre',
  mozza: 'mozzarella',
  yogurt: 'yaourt',
  yaourt_nature: 'yaourt',
  vachequirit: 'vache_qui_rit',
  fromage_fondu: 'vache_qui_rit',

  // Légumes & Fruits
  onion: 'oignon',
  oignons: 'oignon',
  oignon_jaune: 'oignon',
  garlic: 'ail',
  gousse_ail: 'ail',
  gousses_ail: 'ail',
  carrot: 'carotte',
  carottes: 'carotte',
  carotte_fraiche: 'carotte',
  courgettes: 'courgette',
  zucchini: 'courgette',
  tomato: 'tomate',
  tomates: 'tomate',
  tomate_fraiche: 'tomate',
  tomates_fraiches: 'tomate',
  bell_pepper: 'poivron',
  poivrons: 'poivron',
  poivron_rouge: 'poivron',
  poivron_vert: 'poivron',
  cucumber: 'concombre',
  concombres: 'concombre',
  salad: 'salade',
  lettuce: 'salade',
  batavia: 'salade',
  mache: 'salade',
  leek: 'poireau',
  poireaux: 'poireau',
  mushrooms: 'champignon',
  champignons: 'champignon',
  champignons_paris: 'champignon',
  spinach: 'epinard',
  epinards: 'epinard',
  epinards_surgeles: 'epinard',
  avocado: 'avocat',
  avocats: 'avocat',
  lemon: 'citron',
  citrons: 'citron',
  jus_citron: 'citron',
  apple: 'pomme',
  pommes: 'pomme',
  pear: 'poire',
  poires: 'poire',
  banana: 'banane',
  bananes: 'banane',
  cauliflower: 'choufleur',
  chou_fleur: 'choufleur',
  broccoli: 'brocoli',
  brocolis: 'brocoli',

  // Légumineuses & Conserves
  chickpeas: 'poischiches',
  pois_chiches: 'poischiches',
  pois_chiche: 'poischiches',
  lentil: 'lentilles',
  lentille: 'lentilles',
  lentilles_corail: 'lentilles',
  lentilles_vertes: 'lentilles',
  corn: 'mais',
  mais_boite: 'mais',
  sweetcorn: 'mais',
  red_beans: 'haricots',
  haricots_rouges: 'haricots',
  white_beans: 'haricots_blancs',
  green_beans: 'haricots_verts',
  green_peas: 'petits_pois',
  petitspois: 'petits_pois',
  tomates_boite: 'tomboite',
  tomates_pelees: 'tomboite',
  tomates_concassees: 'tomboite',
  tomato_sauce: 'coulis',
  coulis_tomate: 'coulis',
  sauce_tomate: 'coulis',
  coconut_milk: 'laitcoco',
  lait_coco: 'laitcoco',
  lait_de_coco: 'laitcoco',

  // Boulangerie & Wraps
  baguette: 'pain',
  bread: 'pain',
  pain_baguette: 'pain',
  pain_de_mie: 'painmie',
  toast: 'painmie',
  tortilla: 'wrap',
  tortillas: 'wrap',
  wraps: 'wrap',
  fajita: 'wrap',
  burger_bun: 'pain_burger',
  pain_a_burger: 'pain_burger',
  pain_burger_brioche: 'pain_burger',
  pate_pizza: 'patepizza',
  pizza_dough: 'patepizza',

  // Épices & Condiments
  curry: 'curry_poudre',
  poudre_curry: 'curry_poudre',
  curry_powder: 'curry_poudre',
  mustard: 'moutarde',
  moutarde_dijon: 'moutarde',
  soy_sauce: 'sauce_soja',
  soja: 'sauce_soja',
  sauce_bbq: 'sauce_barbecue',
  barbecue: 'sauce_barbecue',
  bouillon_cube: 'bouillon',
  cube_bouillon: 'bouillon',
  herbes: 'herbes_provence',
  herbes_de_provence: 'herbes_provence',
  pestovert: 'pesto',
  pesto_vert: 'pesto'
};

// Smart resolver that normalizes an ID or name to a valid INGREDIENTS key
export function smartResolveIngredientId(rawIdOrName: string): { matchedId: string | null; confidence: 'exact' | 'alias' | 'fuzzy' | 'none' } {
  if (!rawIdOrName || typeof rawIdOrName !== 'string') {
    return { matchedId: null, confidence: 'none' };
  }

  const clean = rawIdOrName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  // 1. Direct exact key match
  if (INGREDIENTS[clean]) {
    return { matchedId: clean, confidence: 'exact' };
  }
  if (INGREDIENTS[rawIdOrName]) {
    return { matchedId: rawIdOrName, confidence: 'exact' };
  }

  // 2. Exact alias match
  if (ALIAS_MAP[clean]) {
    return { matchedId: ALIAS_MAP[clean], confidence: 'alias' };
  }

  // 3. Match against ingredient full names
  const allEntries = Object.values(INGREDIENTS);
  for (const ing of allEntries) {
    const cleanName = ing.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_');

    if (cleanName === clean || cleanName.includes(clean) || clean.includes(cleanName)) {
      return { matchedId: ing.id, confidence: 'fuzzy' };
    }
  }

  // 4. Substring / Token matching
  const tokens = clean.split('_').filter((t) => t.length > 2);
  for (const token of tokens) {
    if (ALIAS_MAP[token]) {
      return { matchedId: ALIAS_MAP[token], confidence: 'fuzzy' };
    }
    if (INGREDIENTS[token]) {
      return { matchedId: token, confidence: 'fuzzy' };
    }
  }

  return { matchedId: null, confidence: 'none' };
}

// Full parsing and validation of AI recipe JSON
export interface ParseAiRecipeResult {
  success: boolean;
  recipe?: Recipe;
  errors: string[];
  warnings: string[];
  resolvedIngredients: {
    original: { id: string; qty: number };
    resolvedId: string;
    resolvedName: string;
    unit: string;
    qty: number;
    wasAdjusted: boolean;
  }[];
  unresolvedIngredients: { id: string; qty: number }[];
}

export function parseAndValidateAiRecipe(jsonInput: string): ParseAiRecipeResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!jsonInput || !jsonInput.trim()) {
    return {
      success: false,
      errors: ['Veuillez coller le code JSON de la recette.'],
      warnings: [],
      resolvedIngredients: [],
      unresolvedIngredients: []
    };
  }

  // Extract JSON block if surrounded by markdown or conversational text
  let cleaned = jsonInput.trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: any) {
    return {
      success: false,
      errors: [`Format JSON invalide : ${err.message || 'erreur de syntaxe'}. Vérifie les accolades et guillemets.`],
      warnings: [],
      resolvedIngredients: [],
      unresolvedIngredients: []
    };
  }

  // Validate recipe name
  if (!parsed.name || typeof parsed.name !== 'string' || !parsed.name.trim()) {
    errors.push('Le champ "name" (nom de la recette) est manquant ou vide.');
  }

  // Validate steps
  let steps: string[] = [];
  if (Array.isArray(parsed.steps) && parsed.steps.length > 0) {
    steps = parsed.steps.map((s: any) => String(s).trim()).filter((s: string) => s.length > 0);
  } else if (typeof parsed.steps === 'string' && parsed.steps.trim()) {
    steps = [parsed.steps.trim()];
  } else {
    steps = ['Préparer les ingrédients et assembler selon la recette.'];
    warnings.push('Aucune étape détaillée détectée, une étape par défaut a été générée.');
  }

  // Validate and resolve ingredients
  const resolvedIngredients: ParseAiRecipeResult['resolvedIngredients'] = [];
  const unresolvedIngredients: { id: string; qty: number }[] = [];

  if (!Array.isArray(parsed.ingredients) || parsed.ingredients.length === 0) {
    errors.push('Le champ "ingredients" doit être un tableau non vide.');
  } else {
    parsed.ingredients.forEach((rawIng: any) => {
      const rawId = String(rawIng.id || rawIng.name || '').trim();
      let rawQty = parseFloat(rawIng.qty ?? rawIng.quantity ?? rawIng.amount ?? 1);
      if (isNaN(rawQty) || rawQty <= 0) rawQty = 1;

      const { matchedId, confidence } = smartResolveIngredientId(rawId);

      if (matchedId && INGREDIENTS[matchedId]) {
        const info = INGREDIENTS[matchedId];
        let finalQty = rawQty;
        let wasAdjusted = false;

        // Auto-fix obvious unit mismatch bugs from AI (e.g. AI gives 0.1 for 100g or 100 for 1 piece)
        if (info.unit === 'g' && finalQty > 0 && finalQty <= 1) {
          finalQty = Math.round(finalQty * 1000); // 0.1 kg -> 100g
          wasAdjusted = true;
          warnings.push(`Quantité de "${info.name}" convertie de ${rawQty}kg en ${finalQty}g.`);
        } else if ((info.unit === 'pièce' || info.unit === 'boîte' || info.unit === 'tranche') && finalQty > 20) {
          finalQty = 1;
          wasAdjusted = true;
          warnings.push(`Quantité de "${info.name}" ajustée à 1 ${info.unit}.`);
        }

        resolvedIngredients.push({
          original: { id: rawId, qty: rawQty },
          resolvedId: matchedId,
          resolvedName: info.name,
          unit: info.unit,
          qty: finalQty,
          wasAdjusted
        });

        if (confidence !== 'exact') {
          warnings.push(`"${rawId}" a été automatiquement reconnu comme "${info.name}" (\`${matchedId}\`).`);
        }
      } else {
        unresolvedIngredients.push({ id: rawId, qty: rawQty });
      }
    });
  }

  if (unresolvedIngredients.length > 0) {
    warnings.push(
      `${unresolvedIngredients.length} ingrédient(s) non reconnu(s) dans la base (${unresolvedIngredients.map((u) => `"${u.id}"`).join(', ')}).`
    );
  }

  if (resolvedIngredients.length === 0 && errors.length === 0) {
    errors.push('Aucun ingrédient n\'a pu être identifié parmi la base de données. Assurez-vous d\'utiliser les identifiants autorisés.');
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      warnings,
      resolvedIngredients,
      unresolvedIngredients
    };
  }

  const recipeType: MealType = ['midi', 'soir'].includes(parsed.type) ? parsed.type : 'soir';

  // Custom nutrition
  let customNutritionObj: Partial<NutritionalValues> | undefined = undefined;
  if (parsed.customNutrition || parsed.nutrition) {
    const src = parsed.customNutrition || parsed.nutrition;
    customNutritionObj = {
      calories: typeof src.calories === 'number' ? src.calories : undefined,
      proteins: typeof src.proteins === 'number' ? src.proteins : undefined,
      carbs: typeof src.carbs === 'number' ? src.carbs : undefined,
      fats: typeof src.fats === 'number' ? src.fats : undefined,
      fiber: typeof src.fiber === 'number' ? src.fiber : undefined
    };
  }

  const validRecipeIngredients: RecipeIngredient[] = resolvedIngredients.map((r) => ({
    id: r.resolvedId,
    qty: r.qty
  }));

  const compiledRecipe: Recipe = {
    id: `custom_ai_${Date.now()}`,
    name: parsed.name.trim(),
    type: recipeType,
    time: parsed.time || '15 min · poêle',
    steps,
    ingredients: validRecipeIngredients,
    tags: Array.isArray(parsed.tags) && parsed.tags.length > 0 ? parsed.tags.map((t: any) => String(t)) : ['Création IA', 'Recette personnalisée'],
    isCustom: true,
    customNutrition: customNutritionObj
  };

  return {
    success: true,
    recipe: compiledRecipe,
    errors: [],
    warnings,
    resolvedIngredients,
    unresolvedIngredients
  };
}

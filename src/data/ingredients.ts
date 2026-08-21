import { Ingredient, StoreProfile } from '../types';

export const INGREDIENTS: Record<string, Ingredient> = {
  flocons: {
    id: 'flocons',
    name: "Flocons d'avoine",
    unit: 'g',
    pack: 500,
    price: 1.80,
    cat: 'Épicerie',
    nutritionPer100: { calories: 370, proteins: 13.5, carbs: 58.7, fats: 7.0, fiber: 10.0 }
  },
  miel: {
    id: 'miel',
    name: 'Miel',
    unit: 'g',
    pack: 250,
    price: 3.50,
    cat: 'Épicerie',
    nutritionPer100: { calories: 304, proteins: 0.3, carbs: 82.4, fats: 0.0, fiber: 0.2 }
  },
  confiture: {
    id: 'confiture',
    name: 'Confiture de fruits',
    unit: 'g',
    pack: 370,
    price: 2.50,
    cat: 'Épicerie',
    nutritionPer100: { calories: 240, proteins: 0.5, carbs: 59.0, fats: 0.1, fiber: 1.2 }
  },
  granola: {
    id: 'granola',
    name: 'Granola / Muesli croustillant',
    unit: 'g',
    pack: 500,
    price: 3.20,
    cat: 'Épicerie',
    nutritionPer100: { calories: 450, proteins: 9.0, carbs: 64.0, fats: 16.5, fiber: 6.5 }
  },
  chocopoudre: {
    id: 'chocopoudre',
    name: 'Chocolat en poudre',
    unit: 'g',
    pack: 400,
    price: 2.80,
    cat: 'Épicerie',
    nutritionPer100: { calories: 380, proteins: 5.5, carbs: 78.0, fats: 3.5, fiber: 5.0 }
  },
  cereales: {
    id: 'cereales',
    name: 'Céréales du matin',
    unit: 'g',
    pack: 375,
    price: 2.50,
    cat: 'Épicerie',
    nutritionPer100: { calories: 380, proteins: 7.5, carbs: 75.0, fats: 2.5, fiber: 4.0 }
  },
  raisin_sec: {
    id: 'raisin_sec',
    name: 'Raisins secs',
    unit: 'g',
    pack: 250,
    price: 2.00,
    cat: 'Épicerie',
    nutritionPer100: { calories: 299, proteins: 3.1, carbs: 79.2, fats: 0.5, fiber: 3.7 }
  },
  farine: {
    id: 'farine',
    name: 'Farine de blé T55',
    unit: 'g',
    pack: 1000,
    price: 1.20,
    cat: 'Épicerie',
    nutritionPer100: { calories: 364, proteins: 10.0, carbs: 76.0, fats: 1.0, fiber: 3.0 }
  },
  pain: {
    id: 'pain',
    name: 'Baguette de pain',
    unit: 'baguette',
    pack: 1,
    price: 1.10,
    cat: 'Boulangerie',
    referenceGrams: 250,
    nutritionPer100: { calories: 275, proteins: 8.5, carbs: 56.0, fats: 1.2, fiber: 3.3 }
  },
  painmie: {
    id: 'painmie',
    name: 'Pain de mie complet',
    unit: 'tranches',
    pack: 14,
    price: 1.30,
    cat: 'Boulangerie',
    referenceGrams: 35,
    nutritionPer100: { calories: 260, proteins: 9.0, carbs: 48.0, fats: 3.5, fiber: 5.5 }
  },
  patepizza: {
    id: 'patepizza',
    name: 'Pâte à pizza prête à dérouler',
    unit: 'pièce',
    pack: 1,
    price: 1.50,
    cat: 'Boulangerie',
    referenceGrams: 260,
    nutritionPer100: { calories: 280, proteins: 7.5, carbs: 48.0, fats: 6.0, fiber: 2.5 }
  },
  pate_brisee: {
    id: 'pate_brisee',
    name: 'Pâte brisée pur beurre',
    unit: 'pièce',
    pack: 1,
    price: 1.00,
    cat: 'Boulangerie',
    referenceGrams: 230,
    nutritionPer100: { calories: 380, proteins: 6.0, carbs: 43.0, fats: 20.0, fiber: 2.0 }
  },
  wrap: {
    id: 'wrap',
    name: 'Tortillas / Wraps de blé',
    unit: 'pièce',
    pack: 6,
    price: 2.20,
    cat: 'Boulangerie',
    referenceGrams: 60,
    nutritionPer100: { calories: 300, proteins: 8.0, carbs: 52.0, fats: 6.0, fiber: 3.5 }
  },
  painchoc: {
    id: 'painchoc',
    name: 'Pains au chocolat pur beurre',
    unit: 'pièce',
    pack: 4,
    price: 2.50,
    cat: 'Boulangerie',
    referenceGrams: 70,
    nutritionPer100: { calories: 415, proteins: 7.5, carbs: 46.0, fats: 22.0, fiber: 2.8 }
  },
  galette_ble: {
    id: 'galette_ble',
    name: 'Galettes de sarrasin bretonnes',
    unit: 'pièce',
    pack: 4,
    price: 2.80,
    cat: 'Boulangerie',
    referenceGrams: 50,
    nutritionPer100: { calories: 180, proteins: 6.0, carbs: 32.0, fats: 2.5, fiber: 4.0 }
  },
  pain_burger: {
    id: 'pain_burger',
    name: 'Pains à burger briochés',
    unit: 'pièce',
    pack: 4,
    price: 1.50,
    cat: 'Boulangerie',
    referenceGrams: 75,
    nutritionPer100: { calories: 290, proteins: 8.0, carbs: 52.0, fats: 5.0, fiber: 2.5 }
  },
  lait: {
    id: 'lait',
    name: 'Lait demi-écrémé',
    unit: 'ml',
    pack: 1000,
    price: 1.05,
    cat: 'Frais',
    nutritionPer100: { calories: 46, proteins: 3.3, carbs: 4.8, fats: 1.6, fiber: 0 }
  },
  beurre: {
    id: 'beurre',
    name: 'Beurre doux',
    unit: 'g',
    pack: 250,
    price: 2.20,
    cat: 'Frais',
    nutritionPer100: { calories: 745, proteins: 0.7, carbs: 0.7, fats: 82.0, fiber: 0 }
  },
  yaourt: {
    id: 'yaourt',
    name: 'Yaourts nature brassés',
    unit: 'pièce',
    pack: 8,
    price: 2.30,
    cat: 'Frais',
    referenceGrams: 125,
    nutritionPer100: { calories: 58, proteins: 4.0, carbs: 5.0, fats: 2.5, fiber: 0 }
  },
  oeuf: {
    id: 'oeuf',
    name: 'Œufs frais plein air',
    unit: 'pièce',
    pack: 6,
    price: 2.20,
    cat: 'Frais',
    referenceGrams: 55,
    nutritionPer100: { calories: 145, proteins: 12.6, carbs: 0.8, fats: 10.0, fiber: 0 }
  },
  fromage: {
    id: 'fromage',
    name: 'Emmental râpé',
    unit: 'g',
    pack: 200,
    price: 2.30,
    cat: 'Frais',
    nutritionPer100: { calories: 375, proteins: 28.0, carbs: 0.5, fats: 29.0, fiber: 0 }
  },
  mozzarella: {
    id: 'mozzarella',
    name: 'Mozzarella',
    unit: 'pièce',
    pack: 1,
    price: 1.00,
    cat: 'Frais',
    referenceGrams: 125,
    nutritionPer100: { calories: 280, proteins: 18.0, carbs: 1.5, fats: 22.0, fiber: 0 }
  },
  feta: {
    id: 'feta',
    name: 'Feta AOP',
    unit: 'g',
    pack: 200,
    price: 1.80,
    cat: 'Frais',
    nutritionPer100: { calories: 275, proteins: 14.5, carbs: 1.5, fats: 23.0, fiber: 0 }
  },
  vache_qui_rit: {
    id: 'vache_qui_rit',
    name: 'Vache qui rit / Fromage fondu',
    unit: 'pièce',
    pack: 12,
    price: 1.90,
    cat: 'Frais',
    referenceGrams: 17.5,
    nutritionPer100: { calories: 230, proteins: 11.5, carbs: 6.0, fats: 17.5, fiber: 0 }
  },
  creme: {
    id: 'creme',
    name: 'Crème fraîche légère 15%',
    unit: 'g',
    pack: 200,
    price: 1.10,
    cat: 'Frais',
    nutritionPer100: { calories: 165, proteins: 2.8, carbs: 4.2, fats: 15.0, fiber: 0 }
  },
  jambon: {
    id: 'jambon',
    name: 'Jambon blanc découenné',
    unit: 'tranche',
    pack: 4,
    price: 2.00,
    cat: 'Frais',
    referenceGrams: 45,
    nutritionPer100: { calories: 115, proteins: 21.0, carbs: 0.8, fats: 3.0, fiber: 0 }
  },
  viande: {
    id: 'viande',
    name: 'Viande hachée 15% MG',
    unit: 'g',
    pack: 400,
    price: 4.50,
    cat: 'Frais',
    nutritionPer100: { calories: 215, proteins: 20.0, carbs: 0.0, fats: 15.0, fiber: 0 }
  },
  lardons: {
    id: 'lardons',
    name: 'Lardons fumés',
    unit: 'g',
    pack: 200,
    price: 2.20,
    cat: 'Frais',
    nutritionPer100: { calories: 310, proteins: 16.0, carbs: 0.5, fats: 27.5, fiber: 0 }
  },
  bacon: {
    id: 'bacon',
    name: 'Bacon fumé en tranches',
    unit: 'tranche',
    pack: 10,
    price: 1.50,
    cat: 'Frais',
    referenceGrams: 15,
    nutritionPer100: { calories: 125, proteins: 22.0, carbs: 1.0, fats: 3.5, fiber: 0 }
  },
  chorizo: {
    id: 'chorizo',
    name: 'Chorizo doux en rondelles',
    unit: 'g',
    pack: 200,
    price: 2.50,
    cat: 'Frais',
    nutritionPer100: { calories: 455, proteins: 23.0, carbs: 2.0, fats: 40.0, fiber: 0 }
  },
  poulet: {
    id: 'poulet',
    name: 'Escalope de filet de poulet',
    unit: 'g',
    pack: 100,
    price: 1.80,
    cat: 'Frais',
    nutritionPer100: { calories: 110, proteins: 23.5, carbs: 0.0, fats: 1.8, fiber: 0 }
  },
  saucisse: {
    id: 'saucisse',
    name: 'Saucisses de Toulouse',
    unit: 'pièce',
    pack: 4,
    price: 2.50,
    cat: 'Frais',
    referenceGrams: 80,
    nutritionPer100: { calories: 280, proteins: 15.5, carbs: 1.0, fats: 24.0, fiber: 0 }
  },
  knacki: {
    id: 'knacki',
    name: 'Saucisses type Knacki',
    unit: 'pièce',
    pack: 10,
    price: 2.00,
    cat: 'Frais',
    referenceGrams: 35,
    nutritionPer100: { calories: 260, proteins: 12.5, carbs: 3.5, fats: 22.0, fiber: 0 }
  },
  surimi: {
    id: 'surimi',
    name: 'Bâtonnets de surimi',
    unit: 'pièce',
    pack: 15,
    price: 2.00,
    cat: 'Frais',
    referenceGrams: 16,
    nutritionPer100: { calories: 105, proteins: 8.5, carbs: 11.5, fats: 2.5, fiber: 0 }
  },
  gnocchi: {
    id: 'gnocchi',
    name: 'Gnocchis frais à poêler',
    unit: 'g',
    pack: 400,
    price: 1.80,
    cat: 'Frais',
    nutritionPer100: { calories: 190, proteins: 5.0, carbs: 38.0, fats: 1.5, fiber: 2.0 }
  },
  pates: {
    id: 'pates',
    name: 'Pâtes (coquillettes, penne, spaghettis)',
    unit: 'g',
    pack: 500,
    price: 1.10,
    cat: 'Épicerie',
    nutritionPer100: { calories: 355, proteins: 12.0, carbs: 72.0, fats: 1.5, fiber: 3.5 }
  },
  riz: {
    id: 'riz',
    name: 'Riz blanc long grain',
    unit: 'g',
    pack: 1000,
    price: 1.80,
    cat: 'Épicerie',
    nutritionPer100: { calories: 360, proteins: 7.5, carbs: 79.0, fats: 0.8, fiber: 1.5 }
  },
  semoule: {
    id: 'semoule',
    name: 'Semoule de blé fine',
    unit: 'g',
    pack: 500,
    price: 1.30,
    cat: 'Épicerie',
    nutritionPer100: { calories: 350, proteins: 11.5, carbs: 72.0, fats: 1.2, fiber: 3.0 }
  },
  couscous: {
    id: 'couscous',
    name: 'Graines de couscous moyen',
    unit: 'g',
    pack: 500,
    price: 1.40,
    cat: 'Épicerie',
    nutritionPer100: { calories: 355, proteins: 12.5, carbs: 71.0, fats: 1.4, fiber: 3.8 }
  },
  nouilles: {
    id: 'nouilles',
    name: 'Nouilles instantanées (ramen)',
    unit: 'sachet',
    pack: 1,
    price: 0.50,
    cat: 'Épicerie',
    referenceGrams: 85,
    nutritionPer100: { calories: 440, proteins: 9.0, carbs: 62.0, fats: 17.5, fiber: 2.5 }
  },
  lentilles: {
    id: 'lentilles',
    name: 'Lentilles corail ou vertes',
    unit: 'g',
    pack: 500,
    price: 1.90,
    cat: 'Épicerie',
    nutritionPer100: { calories: 330, proteins: 24.5, carbs: 52.0, fats: 1.5, fiber: 11.5 }
  },
  coulis: {
    id: 'coulis',
    name: 'Coulis de tomate nature',
    unit: 'g',
    pack: 500,
    price: 1.20,
    cat: 'Épicerie',
    nutritionPer100: { calories: 25, proteins: 1.3, carbs: 4.5, fats: 0.2, fiber: 1.5 }
  },
  tomboite: {
    id: 'tomboite',
    name: 'Tomates concassées en boîte',
    unit: 'boîte',
    pack: 1,
    price: 0.85,
    cat: 'Épicerie',
    referenceGrams: 400,
    nutritionPer100: { calories: 22, proteins: 1.2, carbs: 3.8, fats: 0.1, fiber: 1.4 }
  },
  thon: {
    id: 'thon',
    name: 'Thon au naturel en boîte',
    unit: 'boîte',
    pack: 1,
    price: 1.60,
    cat: 'Épicerie',
    referenceGrams: 140,
    nutritionPer100: { calories: 110, proteins: 25.5, carbs: 0.0, fats: 0.8, fiber: 0 }
  },
  laitcoco: {
    id: 'laitcoco',
    name: 'Lait de coco en brique',
    unit: 'ml',
    pack: 400,
    price: 1.20,
    cat: 'Épicerie',
    nutritionPer100: { calories: 185, proteins: 1.8, carbs: 2.8, fats: 19.0, fiber: 0.5 }
  },
  haricots: {
    id: 'haricots',
    name: 'Haricots rouges cuits en boîte',
    unit: 'boîte',
    pack: 1,
    price: 1.10,
    cat: 'Épicerie',
    referenceGrams: 250,
    nutritionPer100: { calories: 95, proteins: 7.5, carbs: 13.5, fats: 0.6, fiber: 6.5 }
  },
  poischiches: {
    id: 'poischiches',
    name: 'Pois chiches cuits en boîte',
    unit: 'boîte',
    pack: 1,
    price: 0.90,
    cat: 'Épicerie',
    referenceGrams: 265,
    nutritionPer100: { calories: 120, proteins: 7.2, carbs: 16.5, fats: 2.4, fiber: 5.5 }
  },
  mais: {
    id: 'mais',
    name: 'Maïs doux en boîte',
    unit: 'boîte',
    pack: 1,
    price: 0.90,
    cat: 'Épicerie',
    referenceGrams: 285,
    nutritionPer100: { calories: 85, proteins: 3.0, carbs: 15.0, fats: 1.2, fiber: 2.8 }
  },
  haricots_verts: {
    id: 'haricots_verts',
    name: 'Haricots verts extra-fins en boîte',
    unit: 'boîte',
    pack: 1,
    price: 0.90,
    cat: 'Épicerie',
    referenceGrams: 220,
    nutritionPer100: { calories: 25, proteins: 1.5, carbs: 3.5, fats: 0.2, fiber: 2.7 }
  },
  petits_pois: {
    id: 'petits_pois',
    name: 'Petits pois très fins en boîte',
    unit: 'boîte',
    pack: 1,
    price: 0.85,
    cat: 'Épicerie',
    referenceGrams: 260,
    nutritionPer100: { calories: 70, proteins: 5.0, carbs: 9.5, fats: 0.4, fiber: 4.5 }
  },
  pesto: {
    id: 'pesto',
    name: 'Pesto alla Genovese',
    unit: 'g',
    pack: 190,
    price: 2.20,
    cat: 'Épicerie',
    nutritionPer100: { calories: 430, proteins: 4.5, carbs: 6.0, fats: 44.0, fiber: 2.0 }
  },
  legsurg: {
    id: 'legsurg',
    name: 'Poêlée de légumes surgelés',
    unit: 'g',
    pack: 1000,
    price: 2.50,
    cat: 'Surgelé',
    nutritionPer100: { calories: 45, proteins: 2.2, carbs: 6.5, fats: 0.5, fiber: 3.2 }
  },
  epinard: {
    id: 'epinard',
    name: 'Épinards en branches surgelés',
    unit: 'g',
    pack: 1000,
    price: 2.00,
    cat: 'Surgelé',
    nutritionPer100: { calories: 26, proteins: 2.8, carbs: 1.5, fats: 0.5, fiber: 2.5 }
  },
  falafel: {
    id: 'falafel',
    name: 'Falafels aux pois chiches surgelés',
    unit: 'g',
    pack: 400,
    price: 2.80,
    cat: 'Surgelé',
    nutritionPer100: { calories: 230, proteins: 7.5, carbs: 24.0, fats: 11.0, fiber: 5.0 }
  },
  poisson_pane: {
    id: 'poisson_pane',
    name: 'Bâtonnets de poisson pané',
    unit: 'pièce',
    pack: 10,
    price: 3.50,
    cat: 'Surgelé',
    referenceGrams: 30,
    nutritionPer100: { calories: 190, proteins: 13.0, carbs: 16.0, fats: 8.0, fiber: 1.0 }
  },
  pdt_surg: {
    id: 'pdt_surg',
    name: 'Pommes noisettes / Frites four surg.',
    unit: 'g',
    pack: 1000,
    price: 2.20,
    cat: 'Surgelé',
    nutritionPer100: { calories: 175, proteins: 2.5, carbs: 26.0, fats: 6.5, fiber: 2.8 }
  },
  pdt: {
    id: 'pdt',
    name: 'Pommes de terre fraîches',
    unit: 'g',
    pack: 2500,
    price: 3.00,
    cat: 'Fruits & Légumes',
    nutritionPer100: { calories: 77, proteins: 2.0, carbs: 17.5, fats: 0.1, fiber: 2.2 }
  },
  oignon: {
    id: 'oignon',
    name: 'Oignon jaune',
    unit: 'pièce',
    pack: 1,
    price: 0.25,
    cat: 'Fruits & Légumes',
    referenceGrams: 100,
    nutritionPer100: { calories: 40, proteins: 1.1, carbs: 9.3, fats: 0.1, fiber: 1.7 }
  },
  carotte: {
    id: 'carotte',
    name: 'Carottes fraîches',
    unit: 'g',
    pack: 1000,
    price: 1.20,
    cat: 'Fruits & Légumes',
    nutritionPer100: { calories: 41, proteins: 0.9, carbs: 9.6, fats: 0.2, fiber: 2.8 }
  },
  salade: {
    id: 'salade',
    name: 'Salade verte (batavia / mâche)',
    unit: 'pièce',
    pack: 1,
    price: 1.20,
    cat: 'Fruits & Légumes',
    referenceGrams: 150,
    nutritionPer100: { calories: 15, proteins: 1.4, carbs: 2.2, fats: 0.2, fiber: 1.8 }
  },
  champignon: {
    id: 'champignon',
    name: 'Champignons de Paris frais',
    unit: 'g',
    pack: 250,
    price: 1.50,
    cat: 'Fruits & Légumes',
    nutritionPer100: { calories: 22, proteins: 3.1, carbs: 3.3, fats: 0.3, fiber: 1.0 }
  },
  poireau: {
    id: 'poireau',
    name: 'Poireaux frais',
    unit: 'pièce',
    pack: 1,
    price: 0.90,
    cat: 'Fruits & Légumes',
    season: [1, 2, 3, 4, 9, 10, 11, 12],
    referenceGrams: 180,
    nutritionPer100: { calories: 31, proteins: 1.5, carbs: 6.0, fats: 0.3, fiber: 2.2 }
  },
  pomme: {
    id: 'pomme',
    name: 'Pommes Golden ou Gala',
    unit: 'pièce',
    pack: 1,
    price: 0.35,
    cat: 'Fruits & Légumes',
    season: [9, 10, 11, 12, 1, 2, 3, 4],
    referenceGrams: 150,
    nutritionPer100: { calories: 52, proteins: 0.3, carbs: 13.8, fats: 0.2, fiber: 2.4 }
  },
  poire: {
    id: 'poire',
    name: 'Poires Conférence',
    unit: 'pièce',
    pack: 1,
    price: 0.40,
    cat: 'Fruits & Légumes',
    season: [9, 10, 11, 12, 1, 2],
    referenceGrams: 160,
    nutritionPer100: { calories: 57, proteins: 0.4, carbs: 15.2, fats: 0.1, fiber: 3.1 }
  },
  brocoli: {
    id: 'brocoli',
    name: 'Brocoli frais',
    unit: 'pièce',
    pack: 1,
    price: 1.50,
    cat: 'Fruits & Légumes',
    season: [9, 10, 11, 12, 1, 2, 3],
    referenceGrams: 400,
    nutritionPer100: { calories: 34, proteins: 2.8, carbs: 6.6, fats: 0.4, fiber: 2.6 }
  },
  choufleur: {
    id: 'choufleur',
    name: 'Chou-fleur',
    unit: 'pièce',
    pack: 1,
    price: 2.00,
    cat: 'Fruits & Légumes',
    season: [9, 10, 11, 12, 1, 2, 3],
    referenceGrams: 600,
    nutritionPer100: { calories: 25, proteins: 1.9, carbs: 5.0, fats: 0.3, fiber: 2.0 }
  },
  tomate: {
    id: 'tomate',
    name: 'Tomates fraîches',
    unit: 'pièce',
    pack: 1,
    price: 0.35,
    cat: 'Fruits & Légumes',
    season: [6, 7, 8, 9, 10],
    referenceGrams: 120,
    nutritionPer100: { calories: 18, proteins: 0.9, carbs: 3.9, fats: 0.2, fiber: 1.2 }
  },
  concombre: {
    id: 'concombre',
    name: 'Concombre frais',
    unit: 'pièce',
    pack: 1,
    price: 0.70,
    cat: 'Fruits & Légumes',
    season: [5, 6, 7, 8, 9],
    referenceGrams: 300,
    nutritionPer100: { calories: 15, proteins: 0.7, carbs: 3.6, fats: 0.1, fiber: 0.8 }
  },
  courgette: {
    id: 'courgette',
    name: 'Courgettes fraîches',
    unit: 'pièce',
    pack: 1,
    price: 0.80,
    cat: 'Fruits & Légumes',
    season: [6, 7, 8, 9, 10],
    referenceGrams: 200,
    nutritionPer100: { calories: 17, proteins: 1.2, carbs: 3.1, fats: 0.3, fiber: 1.0 }
  },
  poivron: {
    id: 'poivron',
    name: 'Poivron tricolore',
    unit: 'pièce',
    pack: 1,
    price: 0.70,
    cat: 'Fruits & Légumes',
    season: [6, 7, 8, 9, 10],
    referenceGrams: 160,
    nutritionPer100: { calories: 26, proteins: 1.0, carbs: 6.0, fats: 0.3, fiber: 2.1 }
  },
  avocat: {
    id: 'avocat',
    name: 'Avocat mûr à point',
    unit: 'pièce',
    pack: 1,
    price: 1.10,
    cat: 'Fruits & Légumes',
    season: [10, 11, 12, 1, 2, 3, 4],
    referenceGrams: 150,
    nutritionPer100: { calories: 160, proteins: 2.0, carbs: 8.5, fats: 14.7, fiber: 6.7 }
  },
  citron: {
    id: 'citron',
    name: 'Citron jaune frais',
    unit: 'pièce',
    pack: 1,
    price: 0.40,
    cat: 'Fruits & Légumes',
    season: [1, 2, 3, 4, 11, 12],
    referenceGrams: 100,
    nutritionPer100: { calories: 29, proteins: 1.1, carbs: 9.3, fats: 0.3, fiber: 2.8 }
  },
  ail: {
    id: 'ail',
    name: "Gousse d'ail",
    unit: 'gousse',
    pack: 6,
    price: 0.80,
    cat: 'Fruits & Légumes',
    referenceGrams: 5,
    nutritionPer100: { calories: 149, proteins: 6.4, carbs: 33.1, fats: 0.5, fiber: 2.1 }
  },
  patate_douce: {
    id: 'patate_douce',
    name: 'Patate douce',
    unit: 'g',
    pack: 1000,
    price: 2.30,
    cat: 'Fruits & Légumes',
    season: [9, 10, 11, 12, 1, 2, 3],
    nutritionPer100: { calories: 86, proteins: 1.6, carbs: 20.1, fats: 0.1, fiber: 3.0 }
  },
  sardines: {
    id: 'sardines',
    name: "Sardines à l'huile d'olive en boîte",
    unit: 'boîte',
    pack: 1,
    price: 1.35,
    cat: 'Épicerie',
    referenceGrams: 115,
    nutritionPer100: { calories: 208, proteins: 24.0, carbs: 0.0, fats: 12.5, fiber: 0 }
  },
  haricots_blancs: {
    id: 'haricots_blancs',
    name: 'Haricots blancs cuits en boîte',
    unit: 'boîte',
    pack: 1,
    price: 0.95,
    cat: 'Épicerie',
    referenceGrams: 250,
    nutritionPer100: { calories: 102, proteins: 7.0, carbs: 15.0, fats: 0.5, fiber: 6.0 }
  },
  tortellini: {
    id: 'tortellini',
    name: 'Tortellinis frais fromage ou épinards',
    unit: 'g',
    pack: 250,
    price: 1.75,
    cat: 'Frais',
    nutritionPer100: { calories: 285, proteins: 10.5, carbs: 42.0, fats: 8.0, fiber: 2.5 }
  },
  cordon_bleu: {
    id: 'cordon_bleu',
    name: 'Cordons bleus de dinde panés',
    unit: 'pièce',
    pack: 2,
    price: 2.20,
    cat: 'Frais',
    referenceGrams: 100,
    nutritionPer100: { calories: 240, proteins: 14.0, carbs: 18.0, fats: 12.0, fiber: 1.2 }
  },
  cheddar: {
    id: 'cheddar',
    name: 'Tranches de cheddar fondant',
    unit: 'tranche',
    pack: 10,
    price: 1.60,
    cat: 'Frais',
    referenceGrams: 20,
    nutritionPer100: { calories: 340, proteins: 18.0, carbs: 4.0, fats: 28.0, fiber: 0 }
  },
  galette_vegetale: {
    id: 'galette_vegetale',
    name: 'Galette végétale soja & céréales',
    unit: 'pièce',
    pack: 2,
    price: 2.10,
    cat: 'Frais',
    referenceGrams: 100,
    nutritionPer100: { calories: 195, proteins: 15.0, carbs: 14.0, fats: 8.5, fiber: 5.5 }
  },
  salsa: {
    id: 'salsa',
    name: 'Sauce salsa douce aux poivrons',
    unit: 'g',
    pack: 300,
    price: 1.40,
    cat: 'Épicerie',
    nutritionPer100: { calories: 38, proteins: 1.2, carbs: 7.5, fats: 0.2, fiber: 1.8 }
  },
  tortilla_chips: {
    id: 'tortilla_chips',
    name: 'Chips de maïs tortillas',
    unit: 'g',
    pack: 200,
    price: 1.15,
    cat: 'Épicerie',
    nutritionPer100: { calories: 490, proteins: 6.5, carbs: 64.0, fats: 23.0, fiber: 4.5 }
  },
  tofu: {
    id: 'tofu',
    name: 'Tofu nature ou fumé',
    unit: 'g',
    pack: 250,
    price: 1.95,
    cat: 'Frais',
    nutritionPer100: { calories: 125, proteins: 14.0, carbs: 1.5, fats: 7.0, fiber: 1.2 }
  },
  parmesan: {
    id: 'parmesan',
    name: 'Parmesan râpé / Grana Padano',
    unit: 'g',
    pack: 100,
    price: 1.85,
    cat: 'Frais',
    nutritionPer100: { calories: 392, proteins: 33.0, carbs: 0.0, fats: 29.0, fiber: 0 }
  },
  chevre: {
    id: 'chevre',
    name: 'Bûche de fromage de chèvre',
    unit: 'g',
    pack: 180,
    price: 1.70,
    cat: 'Frais',
    nutritionPer100: { calories: 290, proteins: 18.5, carbs: 1.0, fats: 23.5, fiber: 0 }
  },
  sauce_soja: {
    id: 'sauce_soja',
    name: 'Sauce soja salée',
    unit: 'ml',
    pack: 150,
    price: 1.50,
    cat: 'Épicerie',
    nutritionPer100: { calories: 53, proteins: 8.1, carbs: 4.9, fats: 0.1, fiber: 0.8 }
  },
  curry_poudre: {
    id: 'curry_poudre',
    name: 'Curry doux en poudre',
    unit: 'g',
    pack: 40,
    price: 1.10,
    cat: 'Épicerie',
    nutritionPer100: { calories: 325, proteins: 12.7, carbs: 58.2, fats: 14.0, fiber: 33.2 }
  },
  moutarde: {
    id: 'moutarde',
    name: 'Moutarde de Dijon',
    unit: 'g',
    pack: 200,
    price: 0.95,
    cat: 'Épicerie',
    nutritionPer100: { calories: 140, proteins: 7.0, carbs: 5.0, fats: 10.0, fiber: 4.0 }
  },
  pesto_rosso: {
    id: 'pesto_rosso',
    name: 'Pesto Rosso aux tomates séchées',
    unit: 'g',
    pack: 190,
    price: 2.20,
    cat: 'Épicerie',
    nutritionPer100: { calories: 380, proteins: 4.0, carbs: 11.0, fats: 36.0, fiber: 3.5 }
  },
  bouillon: {
    id: 'bouillon',
    name: 'Bouillon cube de légumes',
    unit: 'cube',
    pack: 8,
    price: 1.10,
    cat: 'Épicerie',
    referenceGrams: 10,
    nutritionPer100: { calories: 210, proteins: 10.0, carbs: 20.0, fats: 9.0, fiber: 2.0 }
  },
  banane: {
    id: 'banane',
    name: 'Bananes des Antilles',
    unit: 'pièce',
    pack: 1,
    price: 0.30,
    cat: 'Fruits & Légumes',
    referenceGrams: 120,
    nutritionPer100: { calories: 89, proteins: 1.1, carbs: 22.8, fats: 0.3, fiber: 2.6 }
  },
  saumon: {
    id: 'saumon',
    name: 'Pavé de saumon (frais ou surgelé)',
    unit: 'g',
    pack: 125,
    price: 2.90,
    cat: 'Frais',
    nutritionPer100: { calories: 208, proteins: 20.0, carbs: 0.0, fats: 13.5, fiber: 0 }
  },
  saumon_fume: {
    id: 'saumon_fume',
    name: 'Saumon fumé en tranches',
    unit: 'g',
    pack: 100,
    price: 3.10,
    cat: 'Frais',
    nutritionPer100: { calories: 185, proteins: 22.0, carbs: 0.5, fats: 10.5, fiber: 0 }
  },
  crevettes: {
    id: 'crevettes',
    name: 'Crevettes décortiquées cuites',
    unit: 'g',
    pack: 150,
    price: 3.20,
    cat: 'Frais',
    nutritionPer100: { calories: 95, proteins: 20.5, carbs: 0.8, fats: 1.0, fiber: 0 }
  },
  steak_hache: {
    id: 'steak_hache',
    name: 'Steak haché pur bœuf 15% MG',
    unit: 'pièce',
    pack: 2,
    price: 3.20,
    cat: 'Frais',
    referenceGrams: 100,
    nutritionPer100: { calories: 215, proteins: 20.0, carbs: 0.0, fats: 15.0, fiber: 0 }
  },
  gesiers: {
    id: 'gesiers',
    name: 'Gésiers de canard confits émincés',
    unit: 'g',
    pack: 200,
    price: 2.60,
    cat: 'Frais',
    nutritionPer100: { calories: 150, proteins: 24.0, carbs: 0.5, fats: 6.0, fiber: 0 }
  },
  amandes: {
    id: 'amandes',
    name: 'Amandes effilées ou concassées',
    unit: 'g',
    pack: 125,
    price: 2.10,
    cat: 'Épicerie',
    nutritionPer100: { calories: 579, proteins: 21.0, carbs: 21.5, fats: 49.9, fiber: 12.5 }
  },
  paprika: {
    id: 'paprika',
    name: 'Paprika doux en poudre',
    unit: 'g',
    pack: 40,
    price: 1.00,
    cat: 'Épicerie',
    nutritionPer100: { calories: 282, proteins: 14.1, carbs: 53.9, fats: 12.8, fiber: 34.0 }
  },
  herbes_provence: {
    id: 'herbes_provence',
    name: 'Herbes de Provence',
    unit: 'g',
    pack: 30,
    price: 1.10,
    cat: 'Épicerie',
    nutritionPer100: { calories: 260, proteins: 8.0, carbs: 40.0, fats: 7.0, fiber: 25.0 }
  },
  sauce_barbecue: {
    id: 'sauce_barbecue',
    name: 'Sauce Barbecue BBQ',
    unit: 'g',
    pack: 250,
    price: 1.30,
    cat: 'Épicerie',
    nutritionPer100: { calories: 140, proteins: 1.0, carbs: 32.0, fats: 0.5, fiber: 1.2 }
  }
};

export const STORE_PROFILES: Record<string, StoreProfile> = {
  standard: {
    id: 'standard',
    name: 'Prix moyens supermarché',
    mult: 1.0,
    badge: '⚖️ Standard',
    description: 'Prix repère moyen en France'
  },
  discount: {
    id: 'discount',
    name: 'Hard discount (Lidl, Aldi, Action)',
    mult: 0.85,
    badge: '🟡 Économique -15%',
    description: 'Idéal pour maximiser le pouvoir d\'achat étudiant'
  },
  classique: {
    id: 'classique',
    name: 'Grande surface (Carrefour, Leclerc, Auchan)',
    mult: 1.05,
    badge: '🔵 Classique +5%',
    description: 'Grand choix de marques et formats vrac'
  },
  citadin: {
    id: 'citadin',
    name: 'Supérette de quartier (Monoprix, Franprix, Carrefour City)',
    mult: 1.28,
    badge: '🔴 Supérette +28%',
    description: 'Pratique mais coûts alimentaires significativement plus élevés'
  }
};

export const CATEGORY_ORDER: ('Fruits & Légumes' | 'Frais' | 'Surgelé' | 'Boulangerie' | 'Épicerie')[] = [
  'Fruits & Légumes',
  'Frais',
  'Surgelé',
  'Boulangerie',
  'Épicerie'
];

export const BATCH_INGREDIENTS = [
  'riz', 'pates', 'lentilles', 'pdt', 'oeuf', 'poulet', 'viande', 'semoule', 'couscous', 'carotte'
];

export const ALL_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

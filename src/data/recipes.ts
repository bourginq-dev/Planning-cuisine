import { Recipe } from '../types';

export const BASE_RECIPES: Record<'midi' | 'soir', Recipe[]> = {
  midi: [
    {
      id: 'l1',
      name: 'Salade de pâtes méditerranéenne au thon',
      type: 'midi',
      time: '15 min · casserole',
      tags: ['Équilibré', 'Emportable', 'Riche en oméga-3'],
      steps: [
        'Fais bouillir l’eau salée et cuis les pâtes al dente pendant 10 min.',
        'Égoutte et rince les pâtes à l’eau bien froide pour stopper la cuisson.',
        'Émiette le thon, coupe la tomate et le concombre en dés.',
        'Mélange le tout dans un saladier avec un filet d’huile ou vinaigrette.'
      ],
      ingredients: [
        { id: 'pates', qty: 90 },
        { id: 'thon', qty: 1 },
        { id: 'tomate', qty: 1 },
        { id: 'concombre', qty: 0.3 }
      ]
    },
    {
      id: 'l2',
      name: 'Wrap complet poulet grillé & crudités',
      type: 'midi',
      time: '10 min · poêle',
      tags: ['Haute teneur en protéines', 'Frais', 'Rapide'],
      steps: [
        'Découpe l’escalope de poulet en fines lanières.',
        'Fais revenir les lanières à la poêle 7 min avec du sel, poivre et herbes.',
        'Réchauffe la galette wrap 15 sec, étale un peu de fromage frais ou sauce.',
        'Garnis de salade, dés de tomate et poulet tiède, puis roule fermement.'
      ],
      ingredients: [
        { id: 'wrap', qty: 1 },
        { id: 'poulet', qty: 100 },
        { id: 'salade', qty: 0.3 },
        { id: 'tomate', qty: 0.5 }
      ]
    },
    {
      id: 'l3',
      name: 'Croque-monsieur doré au jambon & emmental',
      type: 'midi',
      time: '8 min · poêle',
      tags: ['Croc gourmand', 'Budget mini', 'Plaisir'],
      steps: [
        'Beurre légèrement l’extérieur des deux tranches de pain de mie.',
        'Garnis l’intérieur d’une tranche de jambon et d’emmental râpé.',
        'Fais dorer à feu moyen dans la poêle 3 à 4 min de chaque côté avec couvercle pour bien faire fondre le fromage.'
      ],
      ingredients: [
        { id: 'painmie', qty: 2 },
        { id: 'jambon', qty: 1 },
        { id: 'fromage', qty: 35 },
        { id: 'beurre', qty: 10 },
        { id: 'salade', qty: 0.25 }
      ]
    },
    {
      id: 'l4',
      name: 'Wrap thon, maïs croquant & batavia',
      type: 'midi',
      time: '5 min · sans équipement',
      tags: ['Sans cuisson', 'Express', 'Économique'],
      steps: [
        'Égoutte le thon et le maïs dans une passoire.',
        'Mélange-les dans un bol avec une pointe de crème ou mayonnaise.',
        'Dépose sur le wrap avec quelques feuilles de salade lavées et roule.'
      ],
      ingredients: [
        { id: 'wrap', qty: 1 },
        { id: 'thon', qty: 1 },
        { id: 'mais', qty: 0.5 },
        { id: 'salade', qty: 0.3 }
      ]
    },
    {
      id: 'l5',
      name: 'Salade rustique de lentilles, carottes & œuf mollet',
      type: 'midi',
      time: '12 min · casserole',
      tags: ['100% Végétarien', 'Riche en fer', 'Super économique'],
      steps: [
        'Cuis les lentilles dans l’eau bouillante 15 min (ou utilise lentilles précuites).',
        'Cuis l’œuf 6 min dans l’eau bouillante pour qu’il soit mollet, puis écale-le.',
        'Râpe la carotte et émince l’oignon.',
        'Mélange les lentilles tièdes avec les carottes, la vinaigrette à la moutarde et dépose l’œuf fendu en deux.'
      ],
      ingredients: [
        { id: 'lentilles', qty: 90 },
        { id: 'carotte', qty: 120 },
        { id: 'oignon', qty: 0.3 },
        { id: 'oeuf', qty: 1 },
        { id: 'moutarde', qty: 10 }
      ]
    },
    {
      id: 'l6',
      name: 'Omelette baveuse au fromage & salade verte',
      type: 'midi',
      time: '8 min · poêle',
      tags: ['Protéines', 'Végétarien', 'Moins de 10 min'],
      steps: [
        'Bats 3 œufs énergiquement avec sel et poivre.',
        'Chauffe le beurre dans la poêle, verse les œufs et remue 1 min.',
        'Parsème d’emmental râpé au centre, replie en chausson et sers avec la salade verte assaisonnée.'
      ],
      ingredients: [
        { id: 'oeuf', qty: 3 },
        { id: 'fromage', qty: 30 },
        { id: 'beurre', qty: 10 },
        { id: 'salade', qty: 0.5 }
      ]
    },
    {
      id: 'l7',
      name: 'Salade de riz au surimi, maïs & concombre',
      type: 'midi',
      time: '15 min · casserole',
      tags: ['Fraîcheur', 'Pratique', 'Batch cooking'],
      steps: [
        'Fais cuire le riz 10 à 12 min dans l’eau bouillante, puis égoutte et refroidis-le.',
        'Coupe le surimi en rondelles et le concombre en petits dés.',
        'Mélange riz, surimi, maïs égoutté et concombre avec une vinaigrette légère.'
      ],
      ingredients: [
        { id: 'riz', qty: 85 },
        { id: 'surimi', qty: 4 },
        { id: 'mais', qty: 0.5 },
        { id: 'concombre', qty: 0.3 }
      ]
    },
    {
      id: 'l8',
      name: 'Penne fraîches à la feta fondante & tomates cerises',
      type: 'midi',
      time: '12 min · casserole',
      tags: ['Saveurs d’Italie', 'Végétarien', 'Simple'],
      steps: [
        'Cuis les pâtes al dente selon le temps indiqué.',
        'Coupe les tomates et la feta en cubes réguliers.',
        'Égoutte les pâtes très chaudes et jette-les sur les tomates et la feta : la chaleur fait fondre le fromage instantanément.'
      ],
      ingredients: [
        { id: 'pates', qty: 95 },
        { id: 'feta', qty: 60 },
        { id: 'tomate', qty: 1 }
      ]
    },
    {
      id: 'l9',
      name: 'Salade grecque de pois chiches, poivron & feta',
      type: 'midi',
      time: '5 min · sans équipement',
      tags: ['Végétarien', 'Index glycémique bas', 'Zéro cuisson'],
      steps: [
        'Rince et égoutte les pois chiches en boîte.',
        'Coupe le poivron, le concombre et l’oignon en dés.',
        'Mélange le tout avec des dés de feta et assaisonne d’un filet de jus de citron et sel.'
      ],
      ingredients: [
        { id: 'poischiches', qty: 1 },
        { id: 'poivron', qty: 0.5 },
        { id: 'concombre', qty: 0.3 },
        { id: 'oignon', qty: 0.2 },
        { id: 'feta', qty: 40 },
        { id: 'citron', qty: 0.5 }
      ]
    },
    {
      id: 'l10',
      name: 'Galette de sarrasin complète œuf-jambon-fromage',
      type: 'midi',
      time: '10 min · poêle',
      tags: ['Sans gluten', 'Gourmand', 'Complet'],
      steps: [
        'Dépose la galette dans une grande poêle beurrée.',
        'Casse l’œuf au centre, étale délicatement le blanc sans percer le jaune.',
        'Ajoute le jambon et l’emmental râpé, replie les 4 bords en carré et laisse cuire 3 min.'
      ],
      ingredients: [
        { id: 'galette_ble', qty: 1 },
        { id: 'oeuf', qty: 1 },
        { id: 'jambon', qty: 1 },
        { id: 'fromage', qty: 25 },
        { id: 'beurre', qty: 5 }
      ]
    },
    {
      id: 'l11',
      name: 'Gnocchis croustillants au pesto vert & parmesan',
      type: 'midi',
      time: '8 min · poêle',
      tags: ['Ultra rapide', 'Croustillant-moelleux', 'Végétarien'],
      steps: [
        'Fais chauffer une noisette de beurre dans la poêle.',
        'Verse les gnocchis directement et fais dorer 6 à 7 min en remuant souvent.',
        'Hors du feu, incorpore le pesto alla Genovese et saupoudre de parmesan râpé.'
      ],
      ingredients: [
        { id: 'gnocchi', qty: 200 },
        { id: 'pesto', qty: 35 },
        { id: 'parmesan', qty: 15 },
        { id: 'beurre', qty: 10 }
      ]
    },
    {
      id: 'l12',
      name: 'Taboulé express à la menthe & tomates fraîches',
      type: 'midi',
      time: '10 min · sans équipement',
      tags: ['Frais', 'Végétarien', 'Facile à préparer'],
      steps: [
        'Verse la semoule de couscous dans un saladier avec le même volume d’eau bouillante salée, couvre 5 min.',
        'Égrène à la fourchette avec un filet d’huile d’olive.',
        'Incorpore les tomates coupées avec leur jus, le concombre et des cubes de feta.'
      ],
      ingredients: [
        { id: 'couscous', qty: 75 },
        { id: 'tomate', qty: 1 },
        { id: 'concombre', qty: 0.5 },
        { id: 'feta', qty: 30 }
      ]
    },
    {
      id: 'l13',
      name: 'Tartines grillées avocat, œuf sur le plat & épices',
      type: 'midi',
      time: '7 min · poêle',
      tags: ['Tendance & Sain', 'Bons lipides', 'Satiété'],
      steps: [
        'Fais dorer la tranche de pain ou pain de mie dans la poêle ou au grille-pain.',
        'Écrase la chair d’avocat à la fourchette avec du sel, poivre et un filet de jus de citron.',
        'Fais cuire l’œuf sur le plat 2 min dans la poêle.',
        'Étale l’avocat sur le pain et dépose l’œuf coulant par-dessus.'
      ],
      ingredients: [
        { id: 'painmie', qty: 2 },
        { id: 'avocat', qty: 0.5 },
        { id: 'oeuf', qty: 1 },
        { id: 'citron', qty: 0.3 }
      ]
    },
    {
      id: 'l14',
      name: 'Egg Fried Rice étudiant (riz sauté œuf & petits pois)',
      type: 'midi',
      time: '10 min · poêle',
      tags: ['Express', 'Saveurs d’Asie', 'Anti-gaspi'],
      steps: [
        'Fais chauffer une poêle avec un filet d’huile.',
        'Ajoute les petits pois égouttés et le riz blanc (cuit d’avance ou restant).',
        'Bouscule le riz sur un côté, casse les 2 œufs, brouille-les rapidement puis mélange tout.',
        'Arrose d’un filet de sauce soja salée avant de servir.'
      ],
      ingredients: [
        { id: 'riz', qty: 85 },
        { id: 'oeuf', qty: 2 },
        { id: 'petits_pois', qty: 0.5 },
        { id: 'sauce_soja', qty: 15 }
      ]
    },
    {
      id: 'l15',
      name: 'Quesadilla poêlée haricots rouges, maïs & fromage fondu',
      type: 'midi',
      time: '8 min · poêle',
      tags: ['Tex-Mex', 'Végétarien', 'Fondant'],
      steps: [
        'Dans un bol, mélange haricots rouges et maïs égouttés.',
        'Dépose un wrap dans la poêle chaude, garnis une moitié de légumes et d’emmental râpé.',
        'Replie en demi-lune et cuis 3 min par face jusqu’à ce que le fromage soit bien coulant.'
      ],
      ingredients: [
        { id: 'wrap', qty: 1 },
        { id: 'haricots', qty: 0.5 },
        { id: 'mais', qty: 0.5 },
        { id: 'fromage', qty: 35 }
      ]
    },
    {
      id: 'l16',
      name: 'Nouilles sautées minute au tofu doré & sauce soja',
      type: 'midi',
      time: '10 min · casserole + poêle',
      tags: ['Protéines végétales', 'Saveurs d’Asie', 'Rapide'],
      steps: [
        'Passe les nouilles 3 min dans l’eau bouillante puis égoutte.',
        'Coupe le tofu en petits dés et fais-le dorer 5 min à feu vif dans la poêle.',
        'Ajoute les nouilles égouttées, la sauce soja et un soupçon d’ail ou oignon.'
      ],
      ingredients: [
        { id: 'nouilles', qty: 1 },
        { id: 'tofu', qty: 120 },
        { id: 'sauce_soja', qty: 20 },
        { id: 'oignon', qty: 0.3 }
      ]
    },
    {
      id: 'l17',
      name: 'Salade de thon, pommes de terre tièdes & moutarde',
      type: 'midi',
      time: '15 min · casserole',
      tags: ['Rustique', 'Protéiné', 'Satiété longue durée'],
      steps: [
        'Coupe les pommes de terre en dés et cuis-les 12 min dans l’eau bouillante.',
        'Égoutte et verse dans un bol encore tiède avec le thon émietté.',
        'Prépare une vinaigrette rapide à la moutarde et mélange délicatement.'
      ],
      ingredients: [
        { id: 'pdt', qty: 220 },
        { id: 'thon', qty: 1 },
        { id: 'moutarde', qty: 10 },
        { id: 'oignon', qty: 0.3 }
      ]
    },
    {
      id: 'l18',
      name: 'Tartine forestière champignons de Paris & chèvre chaud',
      type: 'midi',
      time: '10 min · poêle',
      tags: ['Gourmand', 'Végétarien', 'Bistrot'],
      steps: [
        'Fais revenir les champignons émincés à la poêle avec une noisette de beurre 5 min.',
        'Fais griller le pain, étale les champignons et dépose les rondelles de chèvre.',
        'Passe 1 min sous le grill ou couvre la poêle pour faire fondre le chèvre.'
      ],
      ingredients: [
        { id: 'pain', qty: 0.3 },
        { id: 'champignon', qty: 120 },
        { id: 'chevre', qty: 50 },
        { id: 'beurre', qty: 10 }
      ]
    },
    {
      id: 'l19',
      name: 'Salade piémontaise étudiante aux pommes de terre & jambon',
      type: 'midi',
      time: '15 min · casserole',
      tags: ['Classique', 'Rassasiant', 'Batch cooking'],
      steps: [
        'Fais cuire les pommes de terre coupées en cubes et l’œuf dans l’eau bouillante pendant 12 min.',
        'Égoutte, refroidis à l’eau froide et écale l’œuf.',
        'Coupe le jambon en dés, tranche l’œuf dur et le concombre.',
        'Mélange le tout avec une cuillère de crème ou vinaigrette et assaisonne.'
      ],
      ingredients: [
        { id: 'pdt', qty: 220 },
        { id: 'jambon', qty: 1 },
        { id: 'oeuf', qty: 1 },
        { id: 'concombre', qty: 0.3 },
        { id: 'creme', qty: 25 }
      ]
    },
    {
      id: 'l20',
      name: 'Tartines dorées aux sardines, tomates fraîches & citron',
      type: 'midi',
      time: '5 min · sans cuisson',
      tags: ['Oméga-3', 'Sans cuisson', 'Économique'],
      steps: [
        'Fais griller ou toaste les tranches de pain.',
        'Écrase légèrement les sardines avec un filet de jus de citron, sel et poivre.',
        'Dispose les tranches de tomates fraîches sur le pain puis tartine avec la préparation de sardines.'
      ],
      ingredients: [
        { id: 'pain', qty: 0.3 },
        { id: 'sardines', qty: 1 },
        { id: 'tomate', qty: 1 },
        { id: 'citron', qty: 0.5 }
      ]
    },
    {
      id: 'l21',
      name: 'Salade fraîcheur de haricots blancs au thon & oignon doux',
      type: 'midi',
      time: '5 min · sans cuisson',
      tags: ['Végé & Mer', 'Fibres & Protéines', 'Express'],
      steps: [
        'Rince et égoutte les haricots blancs en boîte.',
        'Émiette le thon et émince finement l’oignon.',
        'Mélange dans un bol avec un filet d’huile, du jus de citron, sel et poivre.'
      ],
      ingredients: [
        { id: 'haricots_blancs', qty: 1 },
        { id: 'thon', qty: 1 },
        { id: 'oignon', qty: 0.3 },
        { id: 'citron', qty: 0.5 }
      ]
    },
    {
      id: 'l22',
      name: 'Tortellinis frais fondants à la crème & parmesan',
      type: 'midi',
      time: '8 min · casserole',
      tags: ['Express', 'Italien', 'Réconfortant'],
      steps: [
        'Plonge les tortellinis dans l’eau frémissante salée pendant 3 à 4 min.',
        'Égoutte en gardant une cuillère d’eau de cuisson.',
        'Remets dans la casserole avec la crème, le parmesan et une noisette de beurre. Mélange 1 min à feu doux.'
      ],
      ingredients: [
        { id: 'tortellini', qty: 200 },
        { id: 'creme', qty: 35 },
        { id: 'parmesan', qty: 15 },
        { id: 'beurre', qty: 10 }
      ]
    },
    {
      id: 'l23',
      name: 'Nachos gratinés haricots rouges, salsa & cheddar fondant',
      type: 'midi',
      time: '10 min · poêle ou four',
      tags: ['Tex-Mex', 'Gourmand', 'Convivial'],
      steps: [
        'Dispose les chips de maïs dans la poêle ou un plat.',
        'Recouvre de haricots rouges égouttés, de cuillères de sauce salsa et de tranches de cheddar.',
        'Couvre la poêle à feu doux pendant 5 min ou passe 5 min au four jusqu’à ce que le fromage soit bien fondu.'
      ],
      ingredients: [
        { id: 'tortilla_chips', qty: 80 },
        { id: 'haricots', qty: 0.5 },
        { id: 'cheddar', qty: 2 },
        { id: 'salsa', qty: 60 }
      ]
    },
    {
      id: 'l24',
      name: 'Wrap croustillant cordon bleu, cheddar & salade',
      type: 'midi',
      time: '10 min · poêle',
      tags: ['Street-food', 'Ultra gourmand', 'Protéines'],
      steps: [
        'Fais dorer le cordon bleu à la poêle 4 min par face.',
        'Coupe le cordon bleu en lamelles.',
        'Dépose sur la tortilla réchauffée avec les tranches de cheddar, la salade et des dés de tomate, puis roule serré.'
      ],
      ingredients: [
        { id: 'wrap', qty: 1 },
        { id: 'cordon_bleu', qty: 1 },
        { id: 'cheddar', qty: 1 },
        { id: 'salade', qty: 0.25 },
        { id: 'tomate', qty: 0.5 }
      ]
    },
    {
      id: 'l99',
      name: 'Sandwich jambon-beurre baguette',
      type: 'midi',
      time: '3 min · sans équipement',
      tags: ['Survie', 'Tradition'],
      isFallback: true,
      steps: [
        'Ouvre la baguette en deux.',
        'Tartine de beurre et dispose les tranches de jambon.'
      ],
      ingredients: [
        { id: 'pain', qty: 0.35 },
        { id: 'beurre', qty: 15 },
        { id: 'jambon', qty: 1 }
      ]
    }
  ],
  soir: [
    {
      id: 's1',
      name: 'Pâtes bolognaise maison à la viande mijotée',
      type: 'soir',
      time: '20 min · casserole + poêle',
      tags: ['Gourmand', 'Riche en fer', 'Incontournable'],
      steps: [
        'Mets les pâtes à cuire dans un grand volume d’eau bouillante salée.',
        'Dans une poêle, fais suer l’oignon émincé, puis ajoute la viande hachée.',
        'Une fois la viande saisie, verse le coulis de tomate, sale, poivre et laisse mijoter 8 min.',
        'Mélange la sauce aux pâtes égouttées et saupoudre d’emmental ou parmesan.'
      ],
      ingredients: [
        { id: 'pates', qty: 100 },
        { id: 'viande', qty: 100 },
        { id: 'coulis', qty: 160 },
        { id: 'oignon', qty: 0.5 },
        { id: 'fromage', qty: 20 }
      ]
    },
    {
      id: 's2',
      name: 'Riz sauté asiatique aux légumes & œuf brouillé',
      type: 'soir',
      time: '15 min · casserole + poêle',
      tags: ['Équilibré', 'Végétarien', 'Anti-gaspi'],
      steps: [
        'Fais cuire le riz blanc 10 min puis égoutte-le bien.',
        'Dans une grande poêle ou wok, saisis la poêlée de légumes surgelés 6 min.',
        'Pousse les légumes sur le côté, casse l’œuf et brouille-le rapidement.',
        'Ajoute le riz cuit, mélange le tout à feu vif 2 min avec la sauce soja salée.'
      ],
      ingredients: [
        { id: 'riz', qty: 90 },
        { id: 'oeuf', qty: 1 },
        { id: 'legsurg', qty: 160 },
        { id: 'sauce_soja', qty: 15 }
      ]
    },
    {
      id: 's3',
      name: 'Vraies pâtes à la carbonara étudiante',
      type: 'soir',
      time: '15 min · casserole + poêle',
      tags: ['Plaisir', 'Onctueux', 'Rapide'],
      steps: [
        'Cuis les pâtes al dente.',
        'Fais griller les lardons à la poêle à sec jusqu’à ce qu’ils soient croustillants.',
        'Dans un bol, mélange l’œuf battu, la crème fraîche et la moitié du fromage râpé.',
        'Hors du feu, verse les pâtes chaudes sur les lardons et incorpore la sauce pour créer une crème liée sans faire cuire l’œuf.'
      ],
      ingredients: [
        { id: 'pates', qty: 100 },
        { id: 'lardons', qty: 75 },
        { id: 'oeuf', qty: 1 },
        { id: 'creme', qty: 40 },
        { id: 'fromage', qty: 20 }
      ]
    },
    {
      id: 's4',
      name: 'Dahl indien crémeux de lentilles corail au coco',
      type: 'soir',
      time: '20 min · casserole',
      tags: ['100% Végétal', 'Riche en fibres & protéines', 'Économique'],
      steps: [
        'Fais revenir l’oignon émincé dans un filet d’huile.',
        'Ajoute les lentilles corail rincées, les tomates concassées, le curry et le lait de coco.',
        'Couvre et laisse mijoter à feu doux 15 min en remuant de temps en temps jusqu’à consistance onctueuse.',
        'Sers chaud avec une portion de riz basmati.'
      ],
      ingredients: [
        { id: 'lentilles', qty: 85 },
        { id: 'laitcoco', qty: 100 },
        { id: 'tomboite', qty: 0.5 },
        { id: 'oignon', qty: 0.5 },
        { id: 'curry_poudre', qty: 5 },
        { id: 'riz', qty: 60 }
      ]
    },
    {
      id: 's5',
      name: 'Chili con carne express aux haricots rouges & maïs',
      type: 'soir',
      time: '20 min · casserole',
      tags: ['Super rassasiant', 'Protéiné', 'Piquant'],
      steps: [
        'Fais revenir la viande hachée et l’oignon dans la casserole 5 min.',
        'Ajoute les haricots rouges rincés, le maïs et les tomates concassées.',
        'Assaisonne d’épices (paprika, cumin, piment) et laisse mijoter 12 min à découvert.',
        'Sers chaud avec du riz blanc.'
      ],
      ingredients: [
        { id: 'viande', qty: 100 },
        { id: 'haricots', qty: 0.8 },
        { id: 'mais', qty: 0.4 },
        { id: 'tomboite', qty: 0.5 },
        { id: 'oignon', qty: 0.5 },
        { id: 'riz', qty: 50 }
      ]
    },
    {
      id: 's6',
      name: 'Curry onctueux de pois chiches & lait de coco',
      type: 'soir',
      time: '15 min · casserole',
      tags: ['Végétarien', 'Confort food', 'Budget malin'],
      steps: [
        'Fais dorer l’oignon émincé dans la casserole avec la poudre de curry.',
        'Verse les pois chiches égouttés, le lait de coco et la moitié de boîte de tomates concassées.',
        'Laisse mijoter à feu doux 10 min. Délicieux accompagné de riz basmati.'
      ],
      ingredients: [
        { id: 'poischiches', qty: 1 },
        { id: 'laitcoco', qty: 110 },
        { id: 'tomboite', qty: 0.5 },
        { id: 'oignon', qty: 0.5 },
        { id: 'curry_poudre', qty: 5 },
        { id: 'riz', qty: 60 }
      ]
    },
    {
      id: 's7',
      name: 'Pizza maison croustillante jambon-fromage',
      type: 'soir',
      time: '18 min · four',
      tags: ['Soirée film', 'Plaisir coupable', 'Facile'],
      steps: [
        'Préchauffe ton four à 210°C (thermostat 7).',
        'Déroule la pâte à pizza sur la plaque du four avec son papier sulfurisé.',
        'Étale le coulis de tomate, dispose les morceaux de jambon et recouvre de fromage râpé ou mozzarella.',
        'Enfourne 14 à 16 min jusqu’à ce que la pâte soit bien dorée et le fromage gratiné.'
      ],
      ingredients: [
        { id: 'patepizza', qty: 1 },
        { id: 'coulis', qty: 100 },
        { id: 'jambon', qty: 2 },
        { id: 'fromage', qty: 60 }
      ]
    },
    {
      id: 's8',
      name: 'Gratin dauphinois fondant à la crème',
      type: 'soir',
      time: '40 min · four',
      tags: ['Gourmand', 'Grand classique', 'Économique'],
      steps: [
        'Épluche et coupe les pommes de terre en très fines rondelles.',
        'Dispose-les dans un plat allant au four en couches régulières.',
        'Verse le mélange lait et crème assaisonné de sel, poivre et muscade.',
        'Enfourne à 180°C pendant 35 à 40 min jusqu’à ce que la pointe d’un couteau s’enfonce sans résistance.'
      ],
      ingredients: [
        { id: 'pdt', qty: 320 },
        { id: 'creme', qty: 100 },
        { id: 'lait', qty: 100 }
      ]
    },
    {
      id: 's9',
      name: 'Poisson pané croustillant & purée maison',
      type: 'soir',
      time: '18 min · poêle + casserole',
      tags: ['Équilibré', 'Réconfortant', 'Facile'],
      steps: [
        'Épluche et coupe les pommes de terre en morceaux, cuis-les 15 min dans l’eau bouillante salée.',
        'Égoutte et écrase au presse-purée avec le lait chaud et une noix de beurre.',
        'En parallèle, fais dorer les poissons panés à la poêle 4 min par face.'
      ],
      ingredients: [
        { id: 'poisson_pane', qty: 2 },
        { id: 'pdt', qty: 250 },
        { id: 'lait', qty: 50 },
        { id: 'beurre', qty: 15 }
      ]
    },
    {
      id: 's10',
      name: 'Poisson pané doré & haricots verts au beurre',
      type: 'soir',
      time: '12 min · poêle',
      tags: ['Léger', 'Riche en fibres', 'Rapide'],
      steps: [
        'Fais dorer les bâtonnets de poisson pané dans la poêle 4 min de chaque côté.',
        'Égoutte les haricots verts et réchauffe-les dans la poêle avec une noisette de beurre et une pointe d’ail.'
      ],
      ingredients: [
        { id: 'poisson_pane', qty: 2 },
        { id: 'haricots_verts', qty: 1 },
        { id: 'beurre', qty: 10 }
      ]
    },
    {
      id: 's11',
      name: 'Burger maison gourmand & pommes noisettes au four',
      type: 'soir',
      time: '20 min · four + poêle',
      tags: ['Fast-food maison', 'Plaisir', 'Protéiné'],
      steps: [
        'Enfourne les pommes noisettes surgelées sur une plaque à 200°C pour 15 min.',
        'Cuis le steak haché à la poêle et pose l’emmental dessus en fin de cuisson.',
        'Toaste légèrement le pain burger, monte avec salade, tomate et le steak fondant.'
      ],
      ingredients: [
        { id: 'pain_burger', qty: 1 },
        { id: 'viande', qty: 100 },
        { id: 'fromage', qty: 25 },
        { id: 'salade', qty: 0.15 },
        { id: 'tomate', qty: 0.5 },
        { id: 'pdt_surg', qty: 150 }
      ]
    },
    {
      id: 's12',
      name: 'Pâtes au pesto alla Genovese & dés de tomate fraîche',
      type: 'soir',
      time: '12 min · casserole',
      tags: ['Rapide', 'Végétarien', 'Moins de 15 min'],
      steps: [
        'Cuis les pâtes al dente, réserve 2 cuillères d’eau de cuisson avant d’égoutter.',
        'Mélange le pesto et l’eau de cuisson réservée aux pâtes chaudes.',
        'Ajoute la tomate coupée en dés frais et saupoudre de parmesan.'
      ],
      ingredients: [
        { id: 'pates', qty: 100 },
        { id: 'pesto', qty: 45 },
        { id: 'tomate', qty: 1 },
        { id: 'parmesan', qty: 15 }
      ]
    },
    {
      id: 's13',
      name: 'Gnocchis fondants aux épinards à la crème & parmesan',
      type: 'soir',
      time: '12 min · poêle',
      tags: ['Gourmand', 'Légumes faciles', 'Végétarien'],
      steps: [
        'Fais dorer les gnocchis 5 min à la poêle avec un peu de beurre.',
        'Dans la même poêle, ajoute les épinards décongelés et la crème fraîche.',
        'Laisse enrober 3 min à feu doux, sale, poivre et termine avec le parmesan râpé.'
      ],
      ingredients: [
        { id: 'gnocchi', qty: 200 },
        { id: 'epinard', qty: 150 },
        { id: 'creme', qty: 40 },
        { id: 'parmesan', qty: 15 }
      ]
    },
    {
      id: 's14',
      name: 'Risotto crémeux aux champignons de Paris & parmesan',
      type: 'soir',
      time: '25 min · casserole',
      tags: ['Grand chef', 'Végétarien', 'Raffiné'],
      steps: [
        'Fais suer l’oignon haché et les champignons émincés dans un peu de beurre.',
        'Ajoute le riz et fais-le nacrer 2 min jusqu’à ce qu’il devienne translucide.',
        'Verse le bouillon de légumes chaud louche par louche pendant 18 min.',
        'Termine en incorporant le parmesan râpé pour lier le risotto.'
      ],
      ingredients: [
        { id: 'riz', qty: 85 },
        { id: 'champignon', qty: 120 },
        { id: 'oignon', qty: 0.5 },
        { id: 'parmesan', qty: 25 },
        { id: 'bouillon', qty: 0.5 },
        { id: 'beurre', qty: 10 }
      ]
    },
    {
      id: 's15',
      name: 'Saucisses grillées & purée onctueuse maison',
      type: 'soir',
      time: '20 min · casserole + poêle',
      tags: ['Rustique', 'Rassasiant', 'Bistrot'],
      steps: [
        'Fais bouillir les pommes de terre coupées en dés pendant 15 min.',
        'Grille les saucisses à la poêle 10 min à feu moyen en les retournant régulièrement.',
        'Écrase les pommes de terre avec beurre et lait, puis sers avec les saucisses bien chaudes.'
      ],
      ingredients: [
        { id: 'saucisse', qty: 2 },
        { id: 'pdt', qty: 250 },
        { id: 'lait', qty: 50 },
        { id: 'beurre', qty: 15 }
      ]
    },
    {
      id: 's16',
      name: 'Velouté d’hiver poireaux-carottes à la crème',
      type: 'soir',
      time: '25 min · casserole',
      tags: ['Vitamines', 'Détox', 'Léger & chaud'],
      steps: [
        'Coupe le blanc du poireau et épluche les carottes en rondelles.',
        'Fais revenir 2 min avec du beurre, puis couvre d’eau salée et cuis 20 min.',
        'Mixe ou écrase finement, incorpore la crème fraîche et assaisonne.'
      ],
      ingredients: [
        { id: 'poireau', qty: 1 },
        { id: 'carotte', qty: 150 },
        { id: 'pdt', qty: 100 },
        { id: 'creme', qty: 35 }
      ]
    },
    {
      id: 's17',
      name: 'Poulet sauté au curry doux & riz parfumé',
      type: 'soir',
      time: '15 min · casserole + poêle',
      tags: ['Protéines', 'Épices douces', 'Équilibré'],
      steps: [
        'Lance la cuisson du riz dans l’eau bouillante pour 10 min.',
        'Coupe le poulet en cubes et fais-le dorer à la poêle 6 min.',
        'Ajoute le lait de coco et la poudre de curry, laisse napper 3 min et sers avec le riz.'
      ],
      ingredients: [
        { id: 'poulet', qty: 110 },
        { id: 'laitcoco', qty: 100 },
        { id: 'curry_poudre', qty: 5 },
        { id: 'riz', qty: 80 }
      ]
    },
    {
      id: 's18',
      name: 'Shakshuka fondante aux œufs pochés & coulis épicé',
      type: 'soir',
      time: '15 min · poêle',
      tags: ['Végétarien', 'Riche en protéines', 'Méditerranéen'],
      steps: [
        'Fais revenir l’oignon et le poivron coupé en lamelles dans un filet d’huile 5 min.',
        'Ajoute le coulis ou tomates concassées, sel, poivre et paprika.',
        'Creuse 2 puits et casse les 2 œufs délicatement. Couvre 4 à 5 min jusqu’à ce que le blanc soit pris mais le jaune encore coulant.',
        'Déguste avec du pain frais.'
      ],
      ingredients: [
        { id: 'oeuf', qty: 2 },
        { id: 'coulis', qty: 150 },
        { id: 'poivron', qty: 0.5 },
        { id: 'oignon', qty: 0.5 },
        { id: 'pain', qty: 0.25 }
      ]
    },
    {
      id: 's19',
      name: 'Poêlée de patates douces, pois chiches & crème coco',
      type: 'soir',
      time: '20 min · poêle',
      tags: ['100% Végétal', 'Riche en antioxydants', 'Doux & épicé'],
      steps: [
        'Épluche la patate douce et coupe-la en petits cubes réguliers.',
        'Fais revenir les cubes dans la poêle 10 min à feu moyen avec un fond d’eau et un couvercle.',
        'Ajoute les pois chiches égouttés, le lait de coco et la poudre de curry.',
        'Laisse mijoter 5 min jusqu’à ce que les patates soient bien tendres.'
      ],
      ingredients: [
        { id: 'patate_douce', qty: 250 },
        { id: 'poischiches', qty: 0.8 },
        { id: 'laitcoco', qty: 90 },
        { id: 'curry_poudre', qty: 5 }
      ]
    },
    {
      id: 's20',
      name: 'Wok de poulet croustillant aux brocolis & sauce soja',
      type: 'soir',
      time: '15 min · poêle',
      tags: ['Healthy', 'Riche en fibres & protéines', 'Faible en gras'],
      steps: [
        'Sépare le brocoli en petits bouquets et cuis-les 4 min à l’eau bouillante ou vapeur.',
        'Fais sauter le poulet émincé à feu vif dans la poêle 5 min avec l’oignon.',
        'Ajoute les brocolis égouttés, la sauce soja et cuis 2 min en remuant constamment.',
        'Sers chaud avec une portion de riz blanc.'
      ],
      ingredients: [
        { id: 'poulet', qty: 110 },
        { id: 'brocoli', qty: 0.5 },
        { id: 'sauce_soja', qty: 20 },
        { id: 'riz', qty: 70 }
      ]
    },
    {
      id: 's21',
      name: 'Tofu sauté croustillant aux carottes & nouilles asiatiques',
      type: 'soir',
      time: '15 min · casserole + poêle',
      tags: ['100% Végétal', 'Protéiné', 'Équilibré'],
      steps: [
        'Cuis les nouilles 3 min dans l’eau bouillante et égoutte.',
        'Coupe le tofu en dés et les carottes en fines lamelles.',
        'Fais dorer le tofu et les carottes dans la poêle 6 min avec un peu d’huile.',
        'Ajoute les nouilles et la sauce soja, mélange à feu vif 2 min.'
      ],
      ingredients: [
        { id: 'tofu', qty: 130 },
        { id: 'carotte', qty: 100 },
        { id: 'nouilles', qty: 1 },
        { id: 'sauce_soja', qty: 20 }
      ]
    },
    {
      id: 's22',
      name: 'Mac & Cheese étudiant ultra crémeux au cheddar',
      type: 'soir',
      time: '12 min · casserole',
      tags: ['Confort food', 'Ultra réconfortant', 'Moins de 15 min'],
      steps: [
        'Fais cuire les pâtes (coquillettes de préférence) dans l’eau salée.',
        'Égoutte en laissant un tout petit fond d’eau.',
        'Ajoute la crème fraîche, le beurre, les tranches de cheddar et l’emmental râpé.',
        'Remue énergiquement à feu doux 2 min jusqu’à obtenir une sauce au fromage filante et onctueuse.'
      ],
      ingredients: [
        { id: 'pates', qty: 100 },
        { id: 'cheddar', qty: 2 },
        { id: 'creme', qty: 40 },
        { id: 'fromage', qty: 25 },
        { id: 'beurre', qty: 10 }
      ]
    },
    {
      id: 's23',
      name: 'Cordon bleu croustillant & poêlée de carottes au beurre',
      type: 'soir',
      time: '15 min · poêle',
      tags: ['Cuisine étudiante', 'Protéines', 'Simple'],
      steps: [
        'Épluche et coupe les carottes en rondelles fines.',
        'Fais fondre une noisette de beurre dans la poêle et cuis les carottes avec un fond d’eau 10 min.',
        'Dans la même poêle, fais dorer le cordon bleu 4 min de chaque côté.',
        'Ajoute les petits pois en fin de cuisson pour les réchauffer 2 min.'
      ],
      ingredients: [
        { id: 'cordon_bleu', qty: 1 },
        { id: 'carotte', qty: 120 },
        { id: 'petits_pois', qty: 0.4 },
        { id: 'beurre', qty: 10 }
      ]
    },
    {
      id: 's24',
      name: 'Tortilla de patatas espagnole aux oignons dorés',
      type: 'soir',
      time: '20 min · poêle',
      tags: ['Tapas', 'Végétarien', 'Rustique & Économique'],
      steps: [
        'Coupe les pommes de terre en fines tranches et émince l’oignon.',
        'Fais dorer pommes de terre et oignons dans la poêle à feu moyen avec un filet d’huile 12 min.',
        'Bats les 3 œufs en omelette avec sel et poivre, verse sur les pommes de terre.',
        'Laisse cuire 4 min, retourne à l’aide d’une assiette et termine la cuisson 2 min.'
      ],
      ingredients: [
        { id: 'oeuf', qty: 3 },
        { id: 'pdt', qty: 220 },
        { id: 'oignon', qty: 0.5 },
        { id: 'salade', qty: 0.25 }
      ]
    },
    {
      id: 's25',
      name: 'Poêlée campagnarde de pommes de terre aux lardons & oignons',
      type: 'soir',
      time: '18 min · poêle',
      tags: ['Rustique', 'Gourmand', 'Montagnard'],
      steps: [
        'Coupe les pommes de terre en petits dés et émince l’oignon.',
        'Fais dorer les lardons et l’oignon dans la poêle 4 min.',
        'Ajoute les dés de pommes de terre, couvre et laisse cuire 12 min à feu moyen en remuant régulièrement.',
        'Termine en saupoudrant d’un peu d’emmental râpé fondant.'
      ],
      ingredients: [
        { id: 'pdt', qty: 250 },
        { id: 'lardons', qty: 80 },
        { id: 'oignon', qty: 0.5 },
        { id: 'fromage', qty: 20 }
      ]
    },
    {
      id: 's26',
      name: 'Gnocchis poêlés au chorizo croustillant & sauce tomate',
      type: 'soir',
      time: '10 min · poêle',
      tags: ['Express', 'Épicé & Gourmand', '10 min chrono'],
      steps: [
        'Fais griller les rondelles de chorizo dans la poêle à sec 2 min pour libérer les sucs.',
        'Ajoute les gnocchis directement et fais-les dorer 5 min.',
        'Verse le coulis de tomate, sale, poivre et laisse napper 3 min avec le fromage râpé.'
      ],
      ingredients: [
        { id: 'gnocchi', qty: 200 },
        { id: 'chorizo', qty: 50 },
        { id: 'coulis', qty: 120 },
        { id: 'fromage', qty: 20 }
      ]
    },
    {
      id: 's27',
      name: 'Galette végétale dorée & riz sauté aux légumes',
      type: 'soir',
      time: '15 min · casserole + poêle',
      tags: ['100% Végétarien', 'Riche en protéines végétales', 'Sain'],
      steps: [
        'Cuis le riz dans l’eau bouillante 10 min.',
        'Fais dorer la galette végétale à la poêle 4 min par face.',
        'Fais sauter les légumes surgelés dans la poêle avec un filet de sauce soja et mélange au riz égoutté.'
      ],
      ingredients: [
        { id: 'galette_vegetale', qty: 1 },
        { id: 'riz', qty: 75 },
        { id: 'legsurg', qty: 150 },
        { id: 'sauce_soja', qty: 15 }
      ]
    },
    {
      id: 's28',
      name: 'Fajitas de poulet poêlé aux poivrons & sauce salsa',
      type: 'soir',
      time: '15 min · poêle',
      tags: ['Tex-Mex', 'Plaisir', 'Protéiné'],
      steps: [
        'Émince le poulet, l’oignon et le poivron en lamelles.',
        'Fais revenir le poulet et les poivrons dans la poêle 8 min à feu vif.',
        'Ajoute la sauce salsa, mélange bien et garnis la tortilla tiède avec une touche d’emmental.'
      ],
      ingredients: [
        { id: 'wrap', qty: 1 },
        { id: 'poulet', qty: 110 },
        { id: 'poivron', qty: 0.5 },
        { id: 'oignon', qty: 0.3 },
        { id: 'salsa', qty: 40 },
        { id: 'fromage', qty: 20 }
      ]
    },
    {
      id: 's29',
      name: 'Dahl onctueux de lentilles corail aux épinards fondants',
      type: 'soir',
      time: '20 min · casserole',
      tags: ['Végétal & Sain', 'Riche en fer', 'Confort'],
      steps: [
        'Fais revenir l’oignon et le curry 2 min dans la casserole.',
        'Ajoute les lentilles rincées, les épinards surgelés et le lait de coco.',
        'Laisse mijoter 15 min à feu doux jusqu’à consistance crémeuse.',
        'Sers chaud avec une portion de riz blanc ou des tranches de pain.'
      ],
      ingredients: [
        { id: 'lentilles', qty: 80 },
        { id: 'epinard', qty: 120 },
        { id: 'laitcoco', qty: 100 },
        { id: 'oignon', qty: 0.5 },
        { id: 'curry_poudre', qty: 5 },
        { id: 'riz', qty: 50 }
      ]
    },
    {
      id: 's99',
      name: 'Salade de survie thon, maïs & tomate',
      type: 'soir',
      time: '5 min · sans équipement',
      tags: ['Dépannage', 'Sans cuisson'],
      isFallback: true,
      steps: [
        'Égoutte le thon et le maïs.',
        'Coupe la tomate en dés et mélange avec un filet d’huile d’olive et du pain.'
      ],
      ingredients: [
        { id: 'thon', qty: 1 },
        { id: 'mais', qty: 0.5 },
        { id: 'tomate', qty: 1 },
        { id: 'pain', qty: 0.25 }
      ]
    }
  ]
};

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const METIERS_DATA = [
  // ═══════════════════════════════════════════════════════════════
  // 🔴 PROFIL PRODUCTEUR - Besoin trésorerie constant
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'boulanger',
    nom: 'Boulanger / Boulangerie',
    description: 'Production et vente de pain et viennoiseries',
    icon: '🍞',
    ordre: 1,
    // Configuration Profil
    profil: 'PRODUCTEUR',
    besoinFinancement: 'ELEVE',
    typeFinancement: JSON.stringify(['fonds-roulement', 'equipement']),
    frequenceCash: 'quotidien',
    dashboardType: 'TRESORERIE',
    modulesActifs: JSON.stringify(['stock', 'fournisseurs', 'financement', 'clients']),
    alertesActives: JSON.stringify(['stock-bas', 'tresorerie-basse', 'credit-client']),
    margeTypique: 0.35,
    cycleVenteJours: 1,
    categories: {
      revenus: [
        { nom: 'Vente de pain', ordre: 1 },
        { nom: 'Vente de viennoiseries', ordre: 2 },
        { nom: 'Vente de pâtisseries', ordre: 3 },
        { nom: 'Commandes événementielles', ordre: 4 },
      ],
      charges: [
        { nom: 'Achat farine', ordre: 1 },
        { nom: 'Achat levure', ordre: 2 },
        { nom: 'Achat sucre', ordre: 3 },
        { nom: 'Achat beurre et matières grasses', ordre: 4 },
        { nom: 'Achat œufs', ordre: 5 },
        { nom: 'Électricité four', ordre: 6 },
        { nom: 'Salaires employés', ordre: 7 },
        { nom: 'Loyer atelier', ordre: 8 },
      ],
    },
  },
  {
    slug: 'restaurant',
    nom: 'Restauration / Maquis',
    description: 'Préparation et vente de repas',
    icon: '🍽️',
    ordre: 2,
    // Configuration Profil
    profil: 'PRODUCTEUR',
    besoinFinancement: 'ELEVE',
    typeFinancement: JSON.stringify(['fonds-roulement', 'equipement']),
    frequenceCash: 'quotidien',
    dashboardType: 'TRESORERIE',
    modulesActifs: JSON.stringify(['stock', 'fournisseurs', 'financement', 'clients']),
    alertesActives: JSON.stringify(['stock-bas', 'tresorerie-basse']),
    margeTypique: 0.40,
    cycleVenteJours: 1,
    categories: {
      revenus: [
        { nom: 'Vente plats du jour', ordre: 1 },
        { nom: 'Vente boissons', ordre: 2 },
        { nom: 'Vente petits déjeuners', ordre: 3 },
        { nom: 'Vente desserts', ordre: 4 },
        { nom: 'Services traiteur', ordre: 5 },
      ],
      charges: [
        { nom: 'Achat denrées alimentaires', ordre: 1 },
        { nom: 'Achat condiments et épices', ordre: 2 },
        { nom: 'Achat boissons', ordre: 3 },
        { nom: 'Gaz et combustible', ordre: 4 },
        { nom: 'Eau et électricité', ordre: 5 },
        { nom: 'Salaires cuisiniers', ordre: 6 },
        { nom: 'Loyer local', ordre: 7 },
        { nom: 'Entretien équipements', ordre: 8 },
      ],
    },
  },
  {
    slug: 'elevage',
    nom: 'Élevage',
    description: 'Élevage d\'animaux (volaille, petits ruminants)',
    icon: '🐔',
    ordre: 3,
    // Configuration Profil
    profil: 'PRODUCTEUR',
    besoinFinancement: 'ELEVE',
    typeFinancement: JSON.stringify(['credit-campagne', 'fonds-roulement']),
    frequenceCash: 'saisonnier',
    dashboardType: 'TRESORERIE',
    modulesActifs: JSON.stringify(['stock', 'cycle-production', 'financement']),
    alertesActives: JSON.stringify(['stock-bas', 'tresorerie-basse', 'fin-cycle']),
    margeTypique: 0.25,
    cycleVenteJours: 90,
    categories: {
      revenus: [
        { nom: 'Vente poulets', ordre: 1 },
        { nom: 'Vente œufs', ordre: 2 },
        { nom: 'Vente moutons/chèvres', ordre: 3 },
        { nom: 'Vente porcs', ordre: 4 },
      ],
      charges: [
        { nom: 'Achat aliments bétail', ordre: 1 },
        { nom: 'Achat poussins/animaux', ordre: 2 },
        { nom: 'Soins vétérinaires', ordre: 3 },
        { nom: 'Vaccins', ordre: 4 },
        { nom: 'Location espace élevage', ordre: 5 },
        { nom: 'Main d\'œuvre', ordre: 6 },
      ],
    },
  },
  {
    slug: 'agriculture',
    nom: 'Agriculture / Maraîchage',
    description: 'Production agricole et maraîchère',
    icon: '🌾',
    ordre: 4,
    // Configuration Profil
    profil: 'PRODUCTEUR',
    besoinFinancement: 'ELEVE',
    typeFinancement: JSON.stringify(['credit-campagne', 'fonds-roulement']),
    frequenceCash: 'saisonnier',
    dashboardType: 'TRESORERIE',
    modulesActifs: JSON.stringify(['stock', 'cycle-production', 'financement']),
    alertesActives: JSON.stringify(['tresorerie-basse', 'fin-saison']),
    margeTypique: 0.30,
    cycleVenteJours: 120,
    categories: {
      revenus: [
        { nom: 'Vente légumes', ordre: 1 },
        { nom: 'Vente fruits', ordre: 2 },
        { nom: 'Vente céréales', ordre: 3 },
        { nom: 'Vente tubercules', ordre: 4 },
      ],
      charges: [
        { nom: 'Achat semences', ordre: 1 },
        { nom: 'Achat engrais', ordre: 2 },
        { nom: 'Achat pesticides', ordre: 3 },
        { nom: 'Location terrain', ordre: 4 },
        { nom: 'Main d\'œuvre', ordre: 5 },
        { nom: 'Irrigation', ordre: 6 },
        { nom: 'Transport récoltes', ordre: 7 },
      ],
    },
  },
  {
    slug: 'riziculture',
    nom: 'Riziculture',
    description: 'Production de riz par campagne agricole',
    icon: '🌾',
    ordre: 5,
    profil: 'PRODUCTEUR',
    besoinFinancement: 'ELEVE',
    typeFinancement: JSON.stringify(['credit-campagne', 'equipement', 'fonds-roulement']),
    frequenceCash: 'saisonnier',
    dashboardType: 'SAISON',
    modulesActifs: JSON.stringify(['stock', 'cycle-production', 'financement', 'equipements']),
    alertesActives: JSON.stringify(['stock-bas', 'fin-saison', 'credit-campagne']),
    margeTypique: 0.28,
    cycleVenteJours: 120,
    categories: {
      revenus: [
        { nom: 'Vente riz paddy', ordre: 1 },
        { nom: 'Vente riz decortique', ordre: 2 },
        { nom: 'Subvention agricole', ordre: 3 },
      ],
      charges: [
        { nom: 'Achat semences riz', ordre: 1 },
        { nom: 'Achat engrais', ordre: 2 },
        { nom: 'Main d oeuvre saisonniere', ordre: 3 },
        { nom: 'Irrigation', ordre: 4 },
        { nom: 'Decorticage', ordre: 5 },
        { nom: 'Transport recolte', ordre: 6 },
      ],
    },
  },
  {
    slug: 'producteur_jus',
    nom: 'Production de jus naturels',
    description: 'Production de jus en bouteilles avec lots et DLC',
    icon: '🥤',
    ordre: 6,
    profil: 'PRODUCTEUR',
    besoinFinancement: 'ELEVE',
    typeFinancement: JSON.stringify(['fonds-roulement', 'equipement']),
    frequenceCash: 'hebdo',
    dashboardType: 'LOT_PEREMPTION',
    modulesActifs: JSON.stringify(['stock', 'lots', 'fournisseurs', 'clients', 'depots', 'pertes']),
    alertesActives: JSON.stringify(['pertes-dlc', 'stock-bas', 'depot-impaye']),
    margeTypique: 0.38,
    cycleVenteJours: 7,
    categories: {
      revenus: [
        { nom: 'Vente jus 50cl', ordre: 1 },
        { nom: 'Vente jus 1L', ordre: 2 },
        { nom: 'Vente aux depots', ordre: 3 },
        { nom: 'Commande evenementielle', ordre: 4 },
      ],
      charges: [
        { nom: 'Achat fruits frais', ordre: 1 },
        { nom: 'Achat sucre et ingredients', ordre: 2 },
        { nom: 'Achat bouteilles et etiquettes', ordre: 3 },
        { nom: 'Gaz et electricite', ordre: 4 },
        { nom: 'Pertes fruits ou jus', ordre: 5 },
        { nom: 'Transport depots', ordre: 6 },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 🟡 PROFIL COMMERCANT - Besoin ponctuel, sur commande
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'couturier',
    nom: 'Couturier / Couturière',
    description: 'Confection et retouche de vêtements',
    icon: '👗',
    ordre: 5,
    // Configuration Profil
    profil: 'COMMERCANT',
    besoinFinancement: 'MOYEN',
    typeFinancement: JSON.stringify(['fonds-roulement']),
    frequenceCash: 'par-commande',
    dashboardType: 'BENEFICE',
    modulesActifs: JSON.stringify(['commandes', 'clients', 'acomptes']),
    alertesActives: JSON.stringify(['commande-retard', 'credit-client']),
    margeTypique: 0.50,
    cycleVenteJours: 7,
    categories: {
      revenus: [
        { nom: 'Confection vêtements sur mesure', ordre: 1 },
        { nom: 'Retouches', ordre: 2 },
        { nom: 'Vente tissus', ordre: 3 },
        { nom: 'Formation couture', ordre: 4 },
      ],
      charges: [
        { nom: 'Achat tissus', ordre: 1 },
        { nom: 'Achat fils et accessoires', ordre: 2 },
        { nom: 'Entretien machines', ordre: 3 },
        { nom: 'Électricité atelier', ordre: 4 },
        { nom: 'Loyer atelier', ordre: 5 },
        { nom: 'Salaires employés', ordre: 6 },
      ],
    },
  },
  {
    slug: 'coiffeur',
    nom: 'Coiffeur / Coiffeuse',
    description: 'Services de coiffure et soins capillaires',
    icon: '💇',
    ordre: 6,
    // Configuration Profil
    profil: 'COMMERCANT',
    besoinFinancement: 'FAIBLE',
    typeFinancement: JSON.stringify(['equipement']),
    frequenceCash: 'quotidien',
    dashboardType: 'BENEFICE',
    modulesActifs: JSON.stringify(['clients', 'prestations', 'produits']),
    alertesActives: JSON.stringify(['stock-produits']),
    margeTypique: 0.60,
    cycleVenteJours: 0,
    categories: {
      revenus: [
        { nom: 'Coupes hommes', ordre: 1 },
        { nom: 'Coupes femmes', ordre: 2 },
        { nom: 'Coiffures événementielles', ordre: 3 },
        { nom: 'Tresses et nattes', ordre: 4 },
        { nom: 'Colorations', ordre: 5 },
        { nom: 'Défrisages', ordre: 6 },
        { nom: 'Vente produits capillaires', ordre: 7 },
      ],
      charges: [
        { nom: 'Achat produits capillaires', ordre: 1 },
        { nom: 'Achat shampoings', ordre: 2 },
        { nom: 'Électricité et eau', ordre: 3 },
        { nom: 'Loyer salon', ordre: 4 },
        { nom: 'Salaires employés', ordre: 5 },
        { nom: 'Entretien matériel', ordre: 6 },
      ],
    },
  },
  {
    slug: 'epicerie',
    nom: 'Épicerie / Boutique',
    description: 'Vente de produits de consommation courante',
    icon: '🏪',
    ordre: 7,
    // Configuration Profil
    profil: 'COMMERCANT',
    besoinFinancement: 'MOYEN',
    typeFinancement: JSON.stringify(['fonds-roulement', 'stock']),
    frequenceCash: 'quotidien',
    dashboardType: 'BENEFICE',
    modulesActifs: JSON.stringify(['stock', 'fournisseurs', 'clients']),
    alertesActives: JSON.stringify(['stock-bas', 'credit-client']),
    margeTypique: 0.20,
    cycleVenteJours: 1,
    categories: {
      revenus: [
        { nom: 'Vente produits alimentaires', ordre: 1 },
        { nom: 'Vente boissons', ordre: 2 },
        { nom: 'Vente produits ménagers', ordre: 3 },
        { nom: 'Vente crédits téléphoniques', ordre: 4 },
        { nom: 'Services divers', ordre: 5 },
      ],
      charges: [
        { nom: 'Achat stocks alimentaires', ordre: 1 },
        { nom: 'Achat boissons', ordre: 2 },
        { nom: 'Achat produits ménagers', ordre: 3 },
        { nom: 'Achat crédits téléphoniques', ordre: 4 },
        { nom: 'Loyer boutique', ordre: 5 },
        { nom: 'Électricité', ordre: 6 },
        { nom: 'Salaires vendeurs', ordre: 7 },
      ],
    },
  },
  {
    slug: 'patisserie',
    nom: 'Patisserie / Gateaux',
    description: 'Gateaux sur commande et patisseries vendues en boutique',
    icon: '🎂',
    ordre: 8,
    profil: 'COMMERCANT',
    besoinFinancement: 'MOYEN',
    typeFinancement: JSON.stringify(['fonds-roulement', 'equipement']),
    frequenceCash: 'par-commande',
    dashboardType: 'COMMANDE_MARGE',
    modulesActifs: JSON.stringify(['stock', 'commandes', 'acomptes', 'clients', 'fournisseurs']),
    alertesActives: JSON.stringify(['stock-bas', 'commande-retard', 'marge-faible', 'pertes-dlc']),
    margeTypique: 0.48,
    cycleVenteJours: 5,
    categories: {
      revenus: [
        { nom: 'Gateaux anniversaire', ordre: 1 },
        { nom: 'Gateaux mariage', ordre: 2 },
        { nom: 'Patisseries boutique', ordre: 3 },
        { nom: 'Commandes evenementielles', ordre: 4 },
      ],
      charges: [
        { nom: 'Achat farine et sucre', ordre: 1 },
        { nom: 'Achat beurre et oeufs', ordre: 2 },
        { nom: 'Achat aromes et decorations', ordre: 3 },
        { nom: 'Gaz et electricite', ordre: 4 },
        { nom: 'Emballages', ordre: 5 },
        { nom: 'Pertes ingredients', ordre: 6 },
      ],
    },
  },
  {
    slug: 'vendeur_huile',
    nom: "Vente d'huile",
    description: "Achat-revente d'huile alimentaire en detail ou demi-gros",
    icon: '🛢️',
    ordre: 9,
    profil: 'COMMERCANT',
    besoinFinancement: 'MOYEN',
    typeFinancement: JSON.stringify(['fonds-roulement', 'stock']),
    frequenceCash: 'quotidien',
    dashboardType: 'BENEFICE',
    modulesActifs: JSON.stringify(['stock', 'fournisseurs', 'clients', 'financement']),
    alertesActives: JSON.stringify(['stock-bas', 'credit-client', 'marge-faible']),
    margeTypique: 0.18,
    cycleVenteJours: 3,
    categories: {
      revenus: [
        { nom: "Vente huile detail", ordre: 1 },
        { nom: "Vente huile demi-gros", ordre: 2 },
        { nom: 'Livraisons clients', ordre: 3 },
      ],
      charges: [
        { nom: "Achat bidons d'huile", ordre: 1 },
        { nom: 'Transport stock', ordre: 2 },
        { nom: 'Emballages et contenants', ordre: 3 },
        { nom: 'Pertes ou fuites', ordre: 4 },
        { nom: 'Loyer boutique', ordre: 5 },
      ],
    },
  },
  {
    slug: 'vente_en_ligne',
    nom: 'Vente en ligne',
    description: 'Vente via WhatsApp, Instagram, Jumia ou autres plateformes',
    icon: '📱',
    ordre: 10,
    profil: 'COMMERCANT',
    besoinFinancement: 'ELEVE',
    typeFinancement: JSON.stringify(['stock', 'fonds-roulement']),
    frequenceCash: 'quotidien',
    dashboardType: 'OMNICANAL',
    modulesActifs: JSON.stringify(['stock', 'commandes', 'clients', 'livraison', 'plateformes', 'retours']),
    alertesActives: JSON.stringify(['stock-bas', 'commande-retard', 'retours-eleves', 'frais-livraison-eleves']),
    margeTypique: 0.31,
    cycleVenteJours: 4,
    categories: {
      revenus: [
        { nom: 'Vente Instagram', ordre: 1 },
        { nom: 'Vente WhatsApp', ordre: 2 },
        { nom: 'Vente plateforme', ordre: 3 },
      ],
      charges: [
        { nom: 'Achat marchandises', ordre: 1 },
        { nom: 'Frais livraison', ordre: 2 },
        { nom: 'Commissions plateforme', ordre: 3 },
        { nom: 'Emballages', ordre: 4 },
        { nom: 'Retours et remboursements', ordre: 5 },
      ],
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // 🟢 PROFIL PRESTATAIRE - Investissement initial, revenus récurrents
  // ═══════════════════════════════════════════════════════════════
  {
    slug: 'mecanique',
    nom: 'Mécanicien / Garage',
    description: 'Réparation et entretien de véhicules',
    icon: '🔧',
    ordre: 8,
    // Configuration Profil
    profil: 'PRESTATAIRE',
    besoinFinancement: 'FAIBLE',
    typeFinancement: JSON.stringify(['equipement']),
    frequenceCash: 'quotidien',
    dashboardType: 'SIMPLE',
    modulesActifs: JSON.stringify(['equipements', 'prestations', 'clients']),
    alertesActives: JSON.stringify(['equipement-maintenance']),
    margeTypique: 0.75,
    cycleVenteJours: 0,
    categories: {
      revenus: [
        { nom: 'Réparations motos', ordre: 1 },
        { nom: 'Réparations voitures', ordre: 2 },
        { nom: 'Vidanges', ordre: 3 },
        { nom: 'Vente pièces détachées', ordre: 4 },
        { nom: 'Services pneumatiques', ordre: 5 },
      ],
      charges: [
        { nom: 'Achat pièces détachées', ordre: 1 },
        { nom: 'Achat huiles et lubrifiants', ordre: 2 },
        { nom: 'Achat outils et équipements', ordre: 3 },
        { nom: 'Loyer garage', ordre: 4 },
        { nom: 'Électricité', ordre: 5 },
        { nom: 'Salaires mécaniciens', ordre: 6 },
      ],
    },
  },
  {
    slug: 'menuiserie',
    nom: 'Menuisier',
    description: 'Fabrication et réparation de meubles',
    icon: '🪚',
    ordre: 9,
    // Configuration Profil
    profil: 'PRESTATAIRE',
    besoinFinancement: 'FAIBLE',
    typeFinancement: JSON.stringify(['equipement']),
    frequenceCash: 'par-commande',
    dashboardType: 'SIMPLE',
    modulesActifs: JSON.stringify(['equipements', 'commandes', 'clients', 'acomptes']),
    alertesActives: JSON.stringify(['commande-retard']),
    margeTypique: 0.45,
    cycleVenteJours: 14,
    categories: {
      revenus: [
        { nom: 'Vente meubles sur mesure', ordre: 1 },
        { nom: 'Réparations meubles', ordre: 2 },
        { nom: 'Vente portes et fenêtres', ordre: 3 },
        { nom: 'Services d\'agencement', ordre: 4 },
      ],
      charges: [
        { nom: 'Achat bois', ordre: 1 },
        { nom: 'Achat clous et visserie', ordre: 2 },
        { nom: 'Achat vernis et peinture', ordre: 3 },
        { nom: 'Entretien outils', ordre: 4 },
        { nom: 'Loyer atelier', ordre: 5 },
        { nom: 'Salaires employés', ordre: 6 },
      ],
    },
  },
  {
    slug: 'transport',
    nom: 'Transport (Zémidjan, Taxi)',
    description: 'Services de transport de personnes',
    icon: '🏍️',
    ordre: 10,
    // Configuration Profil
    profil: 'PRESTATAIRE',
    besoinFinancement: 'FAIBLE',
    typeFinancement: JSON.stringify(['equipement']),
    frequenceCash: 'quotidien',
    dashboardType: 'SIMPLE',
    modulesActifs: JSON.stringify(['equipements', 'prestations', 'carburant']),
    alertesActives: JSON.stringify(['equipement-maintenance', 'assurance-expiration']),
    margeTypique: 0.65,
    cycleVenteJours: 0,
    categories: {
      revenus: [
        { nom: 'Courses zémidjan', ordre: 1 },
        { nom: 'Courses taxi', ordre: 2 },
        { nom: 'Livraisons', ordre: 3 },
      ],
      charges: [
        { nom: 'Carburant', ordre: 1 },
        { nom: 'Entretien véhicule', ordre: 2 },
        { nom: 'Pièces détachées', ordre: 3 },
        { nom: 'Assurance véhicule', ordre: 4 },
        { nom: 'Taxes et permis', ordre: 5 },
      ],
    },
  },
  {
    slug: 'etudiant_revendeur',
    nom: 'Etudiant revendeur',
    description: 'Petite revente sur campus ou quartier avec capital limite',
    icon: '🎒',
    ordre: 99,
    profil: 'PRESTATAIRE',
    besoinFinancement: 'FAIBLE',
    typeFinancement: JSON.stringify([]),
    frequenceCash: 'hebdo',
    dashboardType: 'MICRO_CAPITAL',
    modulesActifs: JSON.stringify(['stock', 'capital', 'prestations']),
    alertesActives: JSON.stringify(['capital-bas', 'invendus-eleves', 'produit-perime']),
    margeTypique: 0.35,
    cycleVenteJours: 7,
    categories: {
      revenus: [
        { nom: 'Vente snacks', ordre: 1 },
        { nom: 'Vente boissons', ordre: 2 },
        { nom: 'Vente accessoires', ordre: 3 },
      ],
      charges: [
        { nom: 'Achat stock snacks', ordre: 1 },
        { nom: 'Achat boissons', ordre: 2 },
        { nom: 'Transport achat', ordre: 3 },
        { nom: 'Invendus ou pertes', ordre: 4 },
      ],
    },
  },
];

async function seedMetiers() {
  console.log('🌱 Seeding métiers avec profils...\n');

  // Nettoyer les anciennes données
  await prisma.categorieTransaction.deleteMany({});
  await prisma.metier.deleteMany({});

  const stats = {
    PRODUCTEUR: 0,
    COMMERCANT: 0,
    PRESTATAIRE: 0,
  };

  for (const metierData of METIERS_DATA) {
    const { categories, ...metierInfo } = metierData;

    // Créer le métier
    const metier = await prisma.metier.create({
      data: metierInfo,
    });

    stats[metier.profil as keyof typeof stats]++;

    const profilIcon = {
      PRODUCTEUR: '🔴',
      COMMERCANT: '🟡',
      PRESTATAIRE: '🟢',
    };

    console.log(
      `${profilIcon[metier.profil as keyof typeof profilIcon]} ${metier.nom}`,
    );
    console.log(`   Profil: ${metier.profil} | Dashboard: ${metier.dashboardType}`);
    console.log(`   Financement: ${metier.besoinFinancement} | Cycle: ${metier.cycleVenteJours}j`);

    // Créer les catégories REVENU
    for (const cat of categories.revenus) {
      await prisma.categorieTransaction.create({
        data: {
          metierId: metier.id,
          type: 'REVENU',
          nom: cat.nom,
          ordre: cat.ordre,
        },
      });
    }

    // Créer les catégories CHARGE
    for (const cat of categories.charges) {
      await prisma.categorieTransaction.create({
        data: {
          metierId: metier.id,
          type: 'CHARGE',
          nom: cat.nom,
          ordre: cat.ordre,
        },
      });
    }

    console.log(
      `   → ${categories.revenus.length} revenus, ${categories.charges.length} charges\n`,
    );
  }

  console.log('═══════════════════════════════════════');
  console.log(`✅ ${METIERS_DATA.length} métiers créés avec succès !\n`);
  console.log('📊 Répartition par profil :');
  console.log(`   🔴 PRODUCTEUR  : ${stats.PRODUCTEUR} métiers (besoin trésorerie constant)`);
  console.log(`   🟡 COMMERCANT  : ${stats.COMMERCANT} métiers (besoin ponctuel)`);
  console.log(`   🟢 PRESTATAIRE : ${stats.PRESTATAIRE} métiers (investissement initial)`);
}

seedMetiers()
  .catch((e) => {
    console.error('❌ Erreur seed métiers:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import type { ProfileDashboardConfig, Transaction, TransactionType } from '../../types';

export interface PilotageQuickAction {
  id: string;
  title: string;
  desc: string;
  icon: string;
  color: string;
  bgColor: string;
  type: TransactionType;
  category?: string;
}

export interface PilotageConfig {
  economicUnit: string;
  unitLabel: string;
  centralQuestion: string;
  icon: string;
  primaryColor: string;
  journalLabel: string;
  analyseLabel: string;
  accountingLabel: string;
  dashboardTitle: string;
  primaryCta: string;
  fabLabel: string;
  planPromise: string;
  quickActions: PilotageQuickAction[];
}

export interface PlanningProgress {
  unlocked: boolean;
  current: number;
  target: number;
  title: string;
  message: string;
  progressText: string;
}

export interface ExpertPrompt {
  trigger: string;
  title: string;
  message: string;
  cta: string;
}

export interface OnboardingUnitGroup {
  id: string;
  unitLabel: string;
  question: string;
  icon: string;
  color: string;
  examples: string;
  metiers: { slug: string; label: string; icon: string }[];
}

const GREEN = '#43A047';
const BLUE = '#1E88E5';
const ORANGE = '#FB8C00';
const EARTH = '#6D4C41';
const DARK_GREEN = '#388E3C';
const INDIGO = '#3F51B5';
const CORAL = '#FF5722';
const VIOLET = '#8E24AA';
const ROSE = '#E91E63';

const action = (
  id: string,
  title: string,
  desc: string,
  icon: string,
  color: string,
  bgColor: string,
  type: TransactionType,
  category?: string,
): PilotageQuickAction => ({ id, title, desc, icon, color, bgColor, type, category });

const baseActions = {
  recette: action('recette', 'Recette', 'Encaisser une vente ou un service', 'trending-up', '#10B981', '#EBFDF5', 'recette', 'vente'),
  depense: action('depense', 'Dépense', 'Enregistrer une sortie d’argent', 'trending-down', '#EF4444', '#FDF2F2', 'depense'),
  intrant: action('intrant', 'Intrant acheté', 'Matière, aliment, ingrédient ou stock', 'cube', BLUE, '#E9F0FF', 'depense', 'intrants'),
  acompte: action('acompte', 'Acompte reçu', 'Suivre un paiement partiel client', 'receipt', BLUE, '#E9F0FF', 'recette', 'acompte'),
  perte: action('perte', 'Perte / invendu', 'Noter une perte, un retour ou une DLC', 'warning', ORANGE, '#FFF3E0', 'depense', 'imprevus'),
};

const UNIT_BY_SLUG: Record<string, string> = {
  boulanger: 'JOURNEE_TRESORERIE',
  restaurant: 'JOURNEE_TRESORERIE',
  epicerie: 'COMMANDE',
  vendeur_huile: 'COMMANDE',
  couturier: 'COMMANDE',
  patisserie: 'RECETTE_COMMANDE',
  elevage: 'BANDE',
  agriculture: 'CAMPAGNE',
  riziculture: 'CAMPAGNE',
  producteur_jus: 'LOT_PERISSABLE',
  vente_en_ligne: 'ARTICLE_CANAL',
  transport: 'JOURNEE_EQUIPEMENT',
  mecanique: 'JOURNEE_EQUIPEMENT',
  menuiserie: 'COMMANDE',
  coiffeur: 'JOURNEE_EQUIPEMENT',
  etudiant_revendeur: 'MICRO_CAPITAL',
  autre: 'JOURNEE_EQUIPEMENT',
};

const UNIT_CONFIGS: Record<string, PilotageConfig> = {
  JOURNEE_TRESORERIE: {
    economicUnit: 'JOURNEE_TRESORERIE',
    unitLabel: 'Ma journée de trésorerie',
    centralQuestion: "Est-ce que j'ai assez de cash pour acheter demain ?",
    icon: '💰',
    primaryColor: ORANGE,
    journalLabel: 'Ma trésorerie',
    analyseLabel: 'Mes prévisions cash',
    accountingLabel: 'Trésorerie et clients',
    dashboardTitle: 'Trésorerie du jour',
    primaryCta: 'Enregistrer ma journée',
    fabLabel: 'Journée +',
    planPromise: 'Piloter le cash quotidien, les achats et les clients à suivre.',
    quickActions: [baseActions.recette, baseActions.depense, action('stock_matiere', 'Stock matière', 'Farine, fruits, boissons ou ingrédients', 'cube', ORANGE, '#FFF3E0', 'depense', 'intrants')],
  },
  COMMANDE: {
    economicUnit: 'COMMANDE',
    unitLabel: 'Ma commande',
    centralQuestion: 'Cette commande est-elle rentable et combien reste à encaisser ?',
    icon: '📦',
    primaryColor: BLUE,
    journalLabel: 'Mes commandes',
    analyseLabel: 'Marge par commande',
    accountingLabel: 'Commandes et acomptes',
    dashboardTitle: 'Commandes et marges',
    primaryCta: 'Saisir une commande',
    fabLabel: 'Commande +',
    planPromise: 'Suivre commandes, acomptes, marges et clients à relancer.',
    quickActions: [action('nouvelle_commande', 'Nouvelle commande', 'Créer une vente ou commande client', 'bag-add', BLUE, '#E9F0FF', 'recette', 'vente'), baseActions.acompte, baseActions.depense],
  },
  BANDE: {
    economicUnit: 'BANDE',
    unitLabel: 'Ma bande / mon lot',
    centralQuestion: 'Ma bande actuelle sera-t-elle rentable ?',
    icon: '🐔',
    primaryColor: EARTH,
    journalLabel: 'Ma bande',
    analyseLabel: 'Rentabilité de la bande',
    accountingLabel: 'Bande et coût de revient',
    dashboardTitle: 'Bande active',
    primaryCta: 'Gérer ma bande',
    fabLabel: 'Bande +',
    planPromise: 'Piloter aliments, mortalité, poids, coût de revient et financement.',
    quickActions: [baseActions.recette, action('depense_intrant', 'Dépense intrant', 'Aliments, poussins, vaccins ou soins', 'nutrition', EARTH, '#EFEBE9', 'depense', 'intrants'), action('mortalite', 'Mortalité', 'Noter une perte dans la bande', 'pulse', '#EF4444', '#FDF2F2', 'depense', 'imprevus'), action('poids', 'Poids / suivi', 'Ajouter une note de suivi de bande', 'speedometer', EARTH, '#EFEBE9', 'depense', 'imprevus')],
  },
  CAMPAGNE: {
    economicUnit: 'CAMPAGNE',
    unitLabel: 'Ma campagne',
    centralQuestion: 'La récolte couvrira-t-elle mes intrants ?',
    icon: '🌾',
    primaryColor: DARK_GREEN,
    journalLabel: 'Ma campagne',
    analyseLabel: 'Budget campagne',
    accountingLabel: 'Campagne et intrants',
    dashboardTitle: 'Campagne active',
    primaryCta: 'Suivre ma campagne',
    fabLabel: 'Campagne +',
    planPromise: 'Suivre intrants, main-d’œuvre, récolte et besoin de crédit.',
    quickActions: [baseActions.recette, action('intrant_achete', 'Intrant acheté', 'Semences, engrais ou produits', 'leaf', DARK_GREEN, '#E8F5E9', 'depense', 'intrants'), action('main_oeuvre', 'Main-d’œuvre', 'Salaire journalier ou saisonnier', 'people', DARK_GREEN, '#E8F5E9', 'depense', 'main')],
  },
  JOURNEE_EQUIPEMENT: {
    economicUnit: 'JOURNEE_EQUIPEMENT',
    unitLabel: 'Mon gain du jour',
    centralQuestion: "Combien ai-je gagné aujourd'hui et mon outil va-t-il bien ?",
    icon: '🏍️',
    primaryColor: GREEN,
    journalLabel: 'Mes gains',
    analyseLabel: 'Mes objectifs',
    accountingLabel: 'Mes gains',
    dashboardTitle: 'Gain du jour',
    primaryCta: 'Enregistrer mon gain',
    fabLabel: 'Gain +',
    planPromise: 'Suivre simplement gains, carburant, entretien et équipement.',
    quickActions: [action('gain_journalier', 'Gain journalier', 'Course, prestation ou service rendu', 'cash', GREEN, '#EBFDF5', 'recette', 'service'), action('carburant', 'Dépense carburant', 'Carburant, transport ou mobilité', 'car', GREEN, '#EBFDF5', 'depense', 'transport'), action('entretien', 'Entretien', 'Réparation ou maintenance outil', 'construct', GREEN, '#EBFDF5', 'depense', 'equipement')],
  },
  MICRO_CAPITAL: {
    economicUnit: 'MICRO_CAPITAL',
    unitLabel: 'Mon capital',
    centralQuestion: 'Est-ce que mon petit capital grossit ou diminue ?',
    icon: '🎒',
    primaryColor: INDIGO,
    journalLabel: 'Mes ventes',
    analyseLabel: 'Mon capital',
    accountingLabel: 'Mes ventes',
    dashboardTitle: 'Rotation du capital',
    primaryCta: 'Voir mon capital',
    fabLabel: 'Vente +',
    planPromise: 'Voir si le capital tourne, grossit et reste disponible.',
    quickActions: [action('vente', 'Vente', 'Vente d’article ou accessoire', 'trending-up', INDIGO, '#EEF2FF', 'recette', 'vente'), action('achat_stock', 'Achat stock', 'Achat de produits à revendre', 'cube', INDIGO, '#EEF2FF', 'depense', 'intrants'), action('invendu', 'Invendu', 'Perte, retour ou produit non vendu', 'alert-circle', ORANGE, '#FFF3E0', 'depense', 'imprevus')],
  },
  LOT_PERISSABLE: {
    economicUnit: 'LOT_PERISSABLE',
    unitLabel: 'Mon lot périssable',
    centralQuestion: 'Mes pertes et DLC mangent-elles ma marge ?',
    icon: '🥤',
    primaryColor: CORAL,
    journalLabel: 'Mes lots',
    analyseLabel: 'Coût par litre',
    accountingLabel: 'Lots, DLC et dépôts',
    dashboardTitle: 'Lots et DLC',
    primaryCta: 'Gérer mon lot',
    fabLabel: 'Lot +',
    planPromise: 'Mesurer quantité produite, pertes, dépôts et coût par litre.',
    quickActions: [action('lot_produit', 'Lot produit', 'Noter production ou vente du lot', 'flask', CORAL, '#FFF0EB', 'recette', 'vente'), baseActions.recette, action('perte_dlc', 'Perte / DLC', 'Jus perdu, invendu ou périmé', 'warning', CORAL, '#FFF0EB', 'depense', 'imprevus'), baseActions.acompte],
  },
  ARTICLE_CANAL: {
    economicUnit: 'ARTICLE_CANAL',
    unitLabel: 'Mon article et mon canal',
    centralQuestion: 'Quel article et quel canal rapportent vraiment ?',
    icon: '📱',
    primaryColor: VIOLET,
    journalLabel: 'Mes ventes',
    analyseLabel: 'Marge par canal',
    accountingLabel: 'Stock, livraisons et retours',
    dashboardTitle: 'Articles et canaux',
    primaryCta: 'Voir mes ventes',
    fabLabel: 'Vente +',
    planPromise: 'Comparer article, canal, livraison, retours et Mobile Money.',
    quickActions: [action('vente_canal', 'Vente', 'WhatsApp, Instagram ou plateforme', 'phone-portrait', VIOLET, '#F5E9F8', 'recette', 'vente'), action('retour', 'Retour', 'Retour client ou remboursement', 'return-down-back', ORANGE, '#FFF3E0', 'depense', 'imprevus'), action('livraison', 'Livraison', 'Frais transport ou livreur', 'bicycle', VIOLET, '#F5E9F8', 'depense', 'transport'), action('reappro', 'Réapprovisionnement', 'Nouveau stock article', 'cube', VIOLET, '#F5E9F8', 'depense', 'intrants')],
  },
  RECETTE_COMMANDE: {
    economicUnit: 'RECETTE_COMMANDE',
    unitLabel: 'Ma recette et ma commande',
    centralQuestion: 'Mon prix couvre-t-il le vrai coût de production ?',
    icon: '🎂',
    primaryColor: ROSE,
    journalLabel: 'Mes commandes',
    analyseLabel: 'Marge par recette',
    accountingLabel: 'Recettes, coûts et commandes',
    dashboardTitle: 'Recettes et commandes',
    primaryCta: 'Saisir une commande',
    fabLabel: 'Commande +',
    planPromise: 'Calculer coût ingrédient, pertes, acompte et prix minimum.',
    quickActions: [action('commande_recue', 'Commande reçue', 'Gâteau, pâtisserie ou événement', 'bag-add', ROSE, '#FCE4EC', 'recette', 'vente'), action('ingredient', 'Ingrédient acheté', 'Farine, sucre, beurre, emballage', 'cube', ROSE, '#FCE4EC', 'depense', 'intrants'), baseActions.perte],
  },
};

const ALIASES: Record<string, string> = {
  JOURNEE_GAIN: 'JOURNEE_EQUIPEMENT',
  GAIN_SIMPLE: 'JOURNEE_EQUIPEMENT',
  PRESTATION_EQUIPEMENT: 'JOURNEE_EQUIPEMENT',
  PRESTATION_ET_PRODUITS: 'JOURNEE_EQUIPEMENT',
  COMMANDE_SIMPLE: 'COMMANDE',
  STOCK_ROTATION: 'COMMANDE',
  STOCK_MARGE: 'COMMANDE',
  COMMANDE_OU_STOCK: 'COMMANDE',
  CYCLE_LOT_CAMPAGNE: 'BANDE',
  CAMPAGNE_RIZ: 'CAMPAGNE',
};

export function getPilotageConfig(input?: { metier?: string | null; economicUnit?: string | null }): PilotageConfig {
  const unitFromSlug = input?.metier ? UNIT_BY_SLUG[input.metier] : undefined;
  const rawUnit = input?.economicUnit || unitFromSlug || 'JOURNEE_EQUIPEMENT';
  const unit = ALIASES[rawUnit] ?? rawUnit;
  return UNIT_CONFIGS[unit] ?? UNIT_CONFIGS.JOURNEE_EQUIPEMENT;
}

function getOnboardingGroupId(economicUnit?: string | null): string {
  const unit = ALIASES[economicUnit ?? ''] ?? economicUnit;
  if (unit === 'JOURNEE_TRESORERIE') return 'cash_day';
  if (['BANDE', 'CAMPAGNE', 'LOT_PERISSABLE'].includes(unit ?? '')) return 'cycle';
  if (['JOURNEE_EQUIPEMENT', 'MICRO_CAPITAL'].includes(unit ?? '')) return 'daily_gain';
  return 'order';
}

export function getOnboardingUnitGroups(configs?: ProfileDashboardConfig[]): OnboardingUnitGroup[] {
  const groups: OnboardingUnitGroup[] = [
    {
      id: 'cash_day',
      unitLabel: UNIT_CONFIGS.JOURNEE_TRESORERIE.unitLabel,
      question: UNIT_CONFIGS.JOURNEE_TRESORERIE.centralQuestion,
      icon: UNIT_CONFIGS.JOURNEE_TRESORERIE.icon,
      color: UNIT_CONFIGS.JOURNEE_TRESORERIE.primaryColor,
      examples: 'Producteur, boulanger, restaurateur',
      metiers: [
        { slug: 'boulanger', label: 'Boulangerie', icon: '🍞' },
        { slug: 'restaurant', label: 'Restauration / maquis', icon: '🍽️' },
      ],
    },
    {
      id: 'order',
      unitLabel: UNIT_CONFIGS.COMMANDE.unitLabel,
      question: UNIT_CONFIGS.COMMANDE.centralQuestion,
      icon: UNIT_CONFIGS.COMMANDE.icon,
      color: UNIT_CONFIGS.COMMANDE.primaryColor,
      examples: 'Commerçant, épicerie, couture, huile',
      metiers: [
        { slug: 'epicerie', label: 'Épicerie / boutique', icon: '🏪' },
        { slug: 'couturier', label: 'Couture', icon: '🧵' },
        { slug: 'vendeur_huile', label: "Vente d'huile", icon: '🛢️' },
        { slug: 'coiffeur', label: 'Coiffure', icon: '💇' },
        { slug: 'vente_en_ligne', label: 'Vente en ligne', icon: '📱' },
        { slug: 'patisserie', label: 'Pâtisserie', icon: '🎂' },
      ],
    },
    {
      id: 'cycle',
      unitLabel: UNIT_CONFIGS.BANDE.unitLabel,
      question: UNIT_CONFIGS.BANDE.centralQuestion,
      icon: UNIT_CONFIGS.BANDE.icon,
      color: UNIT_CONFIGS.BANDE.primaryColor,
      examples: 'Éleveur, agriculteur, producteur de jus',
      metiers: [
        { slug: 'elevage', label: 'Élevage', icon: '🐔' },
        { slug: 'agriculture', label: 'Agriculture / maraîchage', icon: '🌾' },
        { slug: 'riziculture', label: 'Riziculture', icon: '🌾' },
        { slug: 'producteur_jus', label: 'Production de jus', icon: '🥤' },
      ],
    },
    {
      id: 'daily_gain',
      unitLabel: UNIT_CONFIGS.JOURNEE_EQUIPEMENT.unitLabel,
      question: UNIT_CONFIGS.JOURNEE_EQUIPEMENT.centralQuestion,
      icon: UNIT_CONFIGS.JOURNEE_EQUIPEMENT.icon,
      color: UNIT_CONFIGS.JOURNEE_EQUIPEMENT.primaryColor,
      examples: 'Prestataire, transport, étudiant revendeur',
      metiers: [
        { slug: 'transport', label: 'Transport', icon: '🏍️' },
        { slug: 'mecanique', label: 'Mécanique / garage', icon: '🔧' },
        { slug: 'menuiserie', label: 'Menuiserie', icon: '🪚' },
        { slug: 'etudiant_revendeur', label: 'Étudiant revendeur', icon: '🎒' },
      ],
    },
  ];

  if (!configs || configs.length === 0) return groups;

  const metiersByGroup = new Map<string, OnboardingUnitGroup['metiers']>();
  configs.forEach(config => {
    const groupId = getOnboardingGroupId(config.economicUnit);
    const metiers = metiersByGroup.get(groupId) ?? [];
    if (!metiers.some(item => item.slug === config.metier.slug)) {
      metiers.push({
        slug: config.metier.slug,
        label: config.metier.nom,
        icon: config.metier.icon ?? getPilotageConfig({ economicUnit: config.economicUnit }).icon,
      });
      metiersByGroup.set(groupId, metiers);
    }
  });

  return groups
    .map(group => ({
      ...group,
      metiers: metiersByGroup.get(group.id) ?? group.metiers,
    }))
    .filter(group => group.metiers.length > 0);
}

function distinctTransactionDays(transactions: Transaction[]) {
  return new Set(transactions.map(tx => new Date(tx.date).toDateString())).size;
}

function countSales(transactions: Transaction[]) {
  return transactions.filter(tx => tx.type === 'recette' && ['vente', 'service', 'acompte'].includes(tx.categorie)).length;
}

export function getPlanningProgress(transactions: Transaction[], pilotage: PilotageConfig): PlanningProgress {
  const unit = pilotage.economicUnit;
  const sales = countSales(transactions);
  const days = distinctTransactionDays(transactions);
  const hasCycleData = transactions.some(tx => tx.type === 'depense' && ['intrants', 'main', 'equipement'].includes(tx.categorie)) && sales > 0;

  if (['COMMANDE', 'RECETTE_COMMANDE'].includes(unit)) {
    const current = Math.min(sales, 3);
    return {
      unlocked: current >= 3,
      current,
      target: 3,
      title: pilotage.analyseLabel,
      message: current >= 3
        ? 'Vos premières analyses par commande sont prêtes.'
        : `Encore ${3 - current} commande${3 - current > 1 ? 's' : ''} terminée${3 - current > 1 ? 's' : ''} pour débloquer des prévisions utiles.`,
      progressText: `${current}/3 commandes`,
    };
  }

  if (['BANDE', 'CAMPAGNE', 'LOT_PERISSABLE'].includes(unit)) {
    const current = hasCycleData ? 1 : 0;
    return {
      unlocked: current >= 1,
      current,
      target: 1,
      title: pilotage.analyseLabel,
      message: current >= 1
        ? 'Le premier cycle contient assez de données pour une analyse.'
        : 'Terminez un premier cycle avec intrants et recette pour activer la planification.',
      progressText: `${current}/1 cycle`,
    };
  }

  if (['MICRO_CAPITAL', 'ARTICLE_CANAL'].includes(unit)) {
    const current = Math.min(sales, 20);
    return {
      unlocked: current >= 20,
      current,
      target: 20,
      title: pilotage.analyseLabel,
      message: current >= 20
        ? 'Vos recommandations de rotation et de vente sont prêtes.'
        : `Encore ${20 - current} vente${20 - current > 1 ? 's' : ''} pour débloquer des recommandations fiables.`,
      progressText: `${current}/20 ventes`,
    };
  }

  const current = Math.min(days, 7);
  return {
    unlocked: current >= 7,
    current,
    target: 7,
    title: pilotage.analyseLabel,
    message: current >= 7
      ? 'Vos premières prévisions personnalisées sont prêtes.'
      : `Encore ${7 - current} jour${7 - current > 1 ? 's' : ''} de saisie pour débloquer des prévisions utiles.`,
    progressText: `${current}/7 jours`,
  };
}

export function getExpertPrompt(
  transactions: Transaction[],
  config: ProfileDashboardConfig | null,
  pilotage: PilotageConfig,
): ExpertPrompt | null {
  const now = new Date();
  const monthly = transactions.filter(tx => {
    const date = new Date(tx.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const recettes = monthly.filter(tx => tx.type === 'recette').reduce((sum, tx) => sum + tx.montant, 0);
  const depenses = monthly.filter(tx => tx.type === 'depense').reduce((sum, tx) => sum + tx.montant, 0);
  const resultat = recettes - depenses;
  const triggers = config?.expertTriggers ?? [];

  if (monthly.length >= 2 && resultat < 0) {
    return {
      trigger: triggers.includes('marge-negative') ? 'marge-negative' : 'marge-faible',
      title: 'Votre marge est négative ce mois-ci.',
      message: 'Un expert peut vérifier vos chiffres et repérer les coûts qui mangent votre résultat.',
      cta: 'Demander conseil sur cette marge',
    };
  }

  if (monthly.length >= 3 && recettes > 0 && depenses / recettes > 0.85) {
    return {
      trigger: 'marge-faible',
      title: 'Vos charges absorbent presque tout le chiffre d’affaires.',
      message: 'Faites relire vos coûts pour ajuster prix, achats ou pertes avant la fin du mois.',
      cta: 'Faire vérifier mes chiffres',
    };
  }

  const creditTrigger = triggers.find(trigger => trigger.includes('credit') || trigger.includes('bilan'));
  if (monthly.length >= 5 && config?.expertPriority === 'HIGH' && creditTrigger) {
    return {
      trigger: creditTrigger,
      title: `${pilotage.unitLabel} mérite un dossier propre.`,
      message: 'Vos données peuvent servir à préparer un bilan ou un dossier microfinance.',
      cta: creditTrigger.includes('credit') ? 'Préparer mon dossier de crédit' : 'Faire vérifier mes comptes',
    };
  }

  return null;
}

export function getExpertCtaForTrigger(trigger: string): string {
  if (trigger.includes('marge')) return 'Demander conseil sur cette marge';
  if (trigger.includes('credit') || trigger.includes('pret')) return 'Préparer mon dossier de crédit';
  if (trigger.includes('mortalite') || trigger.includes('pertes')) return 'Consulter un expert sur mes pertes';
  if (trigger.includes('bilan')) return 'Faire vérifier mes comptes';
  return 'Faire vérifier mes chiffres';
}

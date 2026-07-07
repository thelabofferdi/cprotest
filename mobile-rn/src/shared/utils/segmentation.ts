import type {
  OptionAccess,
  OptionFamily,
  PlanCode,
  ProfileDashboardConfig,
  SubscriptionPlan,
} from '../../types';
import { getPilotageConfig } from './pilotage';

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    code: 'BASIQUE',
    label: 'Carnet Simple',
    priceFcfa: 700,
    billingPeriod: 'TRIMESTRE',
    promise: 'Suivre simplement ses gains, dépenses, capital ou équipement',
  },
  {
    code: 'MOYEN',
    label: 'Gestion Commerciale',
    priceFcfa: 2100,
    billingPeriod: 'TRIMESTRE',
    promise: 'Piloter les comptes, les clients, le stock simple et les documents utiles',
  },
  {
    code: 'ELEVE',
    label: 'Cycles & Financements',
    priceFcfa: 4900,
    billingPeriod: 'TRIMESTRE',
    promise: 'Piloter une activité complexe, préparer bilan et dossier de prêt',
  },
];

const LEGACY_METIER_MAP: Record<string, string> = {
  marichere: 'agriculture',
  zemitadjan: 'transport',
  couturiere: 'couturier',
  restauratrice: 'restaurant',
  eleveur_volailles: 'elevage',
  vendeuse_boissons: 'producteur_jus',
  mecanicien: 'mecanique',
  commercante_tissus: 'couturier',
  gerant_kiosque: 'epicerie',
};

const METIER_LABELS: Record<string, { nom: string; icon: string; description: string }> = {
  boulanger: { nom: 'Boulangerie', icon: '🍞', description: 'Production avec tresorerie quotidienne' },
  restaurant: { nom: 'Restauration / maquis', icon: '🍽️', description: 'Production et vente de repas' },
  elevage: { nom: 'Elevage', icon: '🐔', description: 'Suivi par bande et pertes' },
  agriculture: { nom: 'Agriculture / maraichage', icon: '🌾', description: 'Suivi par campagne agricole' },
  riziculture: { nom: 'Riziculture', icon: '🌾', description: 'Production de riz par campagne' },
  couturier: { nom: 'Couture', icon: '🧵', description: 'Travail sur commande et acomptes' },
  coiffeur: { nom: 'Coiffure', icon: '💇', description: 'Prestations et produits' },
  epicerie: { nom: 'Epicerie / boutique', icon: '🏪', description: 'Stock et rotation' },
  patisserie: { nom: 'Patisserie', icon: '🎂', description: 'Recettes, commandes et pertes' },
  vendeur_huile: { nom: "Vente d'huile", icon: '🛢️', description: 'Stock, marges et creances' },
  vente_en_ligne: { nom: 'Vente en ligne', icon: '📱', description: 'Articles, canaux, livraisons et retours' },
  producteur_jus: { nom: 'Production de jus', icon: '🥤', description: 'Lots, DLC et depots' },
  mecanique: { nom: 'Mecanique / garage', icon: '🔧', description: 'Prestations et outils' },
  menuiserie: { nom: 'Menuiserie', icon: '🪚', description: 'Commandes simples et equipements' },
  transport: { nom: 'Transport', icon: '🏍️', description: 'Gain journalier et entretien' },
  etudiant_revendeur: { nom: 'Etudiant revendeur', icon: '🎒', description: 'Capital et rotation stock' },
  autre: { nom: 'Autre activite', icon: '💼', description: 'Carnet simple CPRO' },
};

const HIGH_SLUGS = new Set(['elevage', 'agriculture', 'riziculture', 'producteur_jus', 'vente_en_ligne']);
const BASIC_SLUGS = new Set(['transport', 'mecanique', 'menuiserie', 'etudiant_revendeur', 'autre']);

function getPlan(code: PlanCode): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find(plan => plan.code === code) ?? SUBSCRIPTION_PLANS[1];
}

function getSlug(metier?: string): string {
  if (!metier) return 'autre';
  return LEGACY_METIER_MAP[metier] ?? metier;
}

function getOptionAccess(slug: string, plan: PlanCode): {
  accountingFiscality: OptionAccess;
  financialPlanning: OptionAccess;
  expertAssistance: OptionAccess;
} {
  if (plan === 'BASIQUE') {
    return {
      accountingFiscality: 'LIGHT',
      financialPlanning: slug === 'etudiant_revendeur' ? 'STRONG' : 'CONTEXTUAL',
      expertAssistance: 'CONTEXTUAL',
    };
  }

  if (plan === 'ELEVE') {
    return {
      accountingFiscality: 'REQUIRED',
      financialPlanning: 'REQUIRED',
      expertAssistance: 'STRONG',
    };
  }

  return {
    accountingFiscality: 'REQUIRED',
    financialPlanning: 'STRONG',
    expertAssistance: 'STRONG',
  };
}

export function getFallbackDashboardConfig(metier?: string): ProfileDashboardConfig {
  const slug = getSlug(metier);
  const pilotage = getPilotageConfig({ metier: slug });
  const isHigh = HIGH_SLUGS.has(slug);
  const isBasic = BASIC_SLUGS.has(slug);
  const recommendedPlan: PlanCode = isHigh ? 'ELEVE' : isBasic ? 'BASIQUE' : 'MOYEN';
  const optionFamily: OptionFamily = recommendedPlan === 'BASIQUE' ? 'OPTIONS_SELECTIVES' : 'TOUTES_OPTIONS';
  const label = METIER_LABELS[slug] ?? METIER_LABELS.autre;
  const modulesActifs = recommendedPlan === 'BASIQUE'
    ? ['journal', 'equipements', 'prestations']
    : recommendedPlan === 'ELEVE'
      ? ['journal', 'stock', 'cycle-production', 'financement', 'lots-pertes', 'expert']
      : ['journal', 'stock', 'clients', 'fournisseurs', 'documents', 'financement'];

  return {
    profil: isBasic ? 'PRESTATAIRE' : 'COMMERCANT',
    dashboardType: recommendedPlan === 'BASIQUE' ? 'SIMPLE' : recommendedPlan === 'ELEVE' ? 'CYCLE' : 'BENEFICE',
    optionFamily,
    economicUnit: pilotage.economicUnit,
    recommendedPlan,
    allowedPlans: recommendedPlan === 'BASIQUE' ? ['BASIQUE', 'MOYEN'] : ['MOYEN', 'ELEVE'],
    besoinFinancement: recommendedPlan === 'BASIQUE' ? 'FAIBLE' : recommendedPlan === 'ELEVE' ? 'ELEVE' : 'MOYEN',
    typeFinancement: recommendedPlan === 'BASIQUE' ? ['equipement'] : ['fonds-roulement', 'equipement'],
    frequenceCash: recommendedPlan === 'ELEVE' ? 'saisonnier' : 'quotidien',
    modulesActifs,
    modulesMasques: recommendedPlan === 'BASIQUE' ? ['cycle-production', 'lots-pertes', 'fiscalite-avancee'] : [],
    alertesActives: recommendedPlan === 'BASIQUE' ? ['equipement-maintenance'] : ['stock-bas', 'marge-faible', 'credit-client'],
    margeTypique: null,
    cycleVenteJours: null,
    accountingLevel: recommendedPlan === 'ELEVE' ? 4 : recommendedPlan === 'MOYEN' ? 2 : 1,
    planningType: recommendedPlan === 'BASIQUE' ? 'GAIN_SIMPLE' : recommendedPlan === 'ELEVE' ? 'PLANIFICATION_AVANCEE' : 'MARGE_ET_TRESORERIE',
    expertPriority: recommendedPlan === 'ELEVE' ? 'HIGH' : recommendedPlan === 'MOYEN' ? 'MEDIUM' : 'LOW',
    options: getOptionAccess(slug, recommendedPlan),
    planFeatures: {
      basique: recommendedPlan === 'BASIQUE' ? 'CARNET_SIMPLE' : 'NON_RECOMMANDE',
      moyen: 'MODULES_STANDARD',
      eleve: recommendedPlan === 'ELEVE' ? 'MODULES_AVANCES_PLUS_EXPERT' : 'UPGRADE_DISPONIBLE',
    },
    expertTriggers: ['marge-faible', 'demande-credit', 'bilan', 'fiscalite'],
    upgradeTriggers: recommendedPlan === 'BASIQUE'
      ? ['stock', 'clients', 'fournisseurs', 'documents', 'commandes']
      : ['cycles', 'lots', 'pertes-dlc', 'bilan', 'pret-microfinance'],
    subscription: {
      currentPlan: getPlan(recommendedPlan),
      allPlans: SUBSCRIPTION_PLANS,
    },
    metier: {
      slug,
      nom: label.nom,
      icon: label.icon,
      description: label.description,
    },
    features: {
      showFinancementSection: recommendedPlan !== 'BASIQUE',
      showStockModule: modulesActifs.includes('stock'),
      showCommandesModule: modulesActifs.includes('commandes'),
      showEquipementsModule: modulesActifs.includes('equipements'),
      showClientsModule: modulesActifs.includes('clients'),
      showFournisseursModule: modulesActifs.includes('fournisseurs'),
      showTresorerieAlert: true,
      showStockAlert: modulesActifs.includes('stock'),
      showCreditAlert: recommendedPlan !== 'BASIQUE',
      showComptabiliteFiscalite: recommendedPlan !== 'BASIQUE',
      showFinancialPlanning: recommendedPlan !== 'BASIQUE' || slug === 'etudiant_revendeur',
      showExpertAssistance: recommendedPlan !== 'BASIQUE',
      showAdvancedPlanning: recommendedPlan === 'ELEVE',
      showDocumentsModule: recommendedPlan !== 'BASIQUE',
      showSubscriptionUpgrade: true,
    },
    ui: {
      dashboardLayout: recommendedPlan === 'BASIQUE' ? 'simple' : recommendedPlan === 'ELEVE' ? 'cycle' : 'benefice',
      primaryColor: pilotage.primaryColor,
      profilLabel: pilotage.unitLabel,
      profilDescription: pilotage.centralQuestion,
    },
  };
}

export function formatPlanPrice(plan: SubscriptionPlan): string {
  return `${plan.priceFcfa.toLocaleString('fr-FR')} FCFA / trimestre`;
}

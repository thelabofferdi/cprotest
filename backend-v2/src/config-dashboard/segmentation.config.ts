export type PlanCode = 'BASIQUE' | 'MOYEN' | 'ELEVE';
export type OptionFamily = 'TOUTES_OPTIONS' | 'OPTIONS_SELECTIVES';
export type OptionAccess = 'LIGHT' | 'CONTEXTUAL' | 'STRONG' | 'REQUIRED';
export type ExpertPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface SubscriptionPlan {
  code: PlanCode;
  label: string;
  priceFcfa: number;
  billingPeriod: 'TRIMESTRE';
  promise: string;
}

export interface SegmentationProfile {
  optionFamily: OptionFamily;
  economicUnit: string;
  recommendedPlan: PlanCode;
  allowedPlans: PlanCode[];
  accountingLevel: 1 | 2 | 3 | 4 | 5;
  planningType: string;
  expertPriority: ExpertPriority;
  options: {
    accountingFiscality: OptionAccess;
    financialPlanning: OptionAccess;
    expertAssistance: OptionAccess;
  };
  modulesMasques: string[];
  expertTriggers: string[];
  upgradeTriggers: string[];
  planFeatures: Record<Lowercase<PlanCode>, string>;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    code: 'BASIQUE',
    label: 'Basique',
    priceFcfa: 700,
    billingPeriod: 'TRIMESTRE',
    promise: 'Suivre simplement ses gains, depenses, capital ou equipement',
  },
  {
    code: 'MOYEN',
    label: 'Moyen',
    priceFcfa: 2100,
    billingPeriod: 'TRIMESTRE',
    promise: 'Piloter les comptes, les clients, le stock simple et les documents utiles',
  },
  {
    code: 'ELEVE',
    label: 'Eleve',
    priceFcfa: 4900,
    billingPeriod: 'TRIMESTRE',
    promise: 'Piloter une activite complexe, preparer bilan, planification avancee et dossier de pret',
  },
];

const BASIC_PROFILE: SegmentationProfile = {
  optionFamily: 'OPTIONS_SELECTIVES',
  economicUnit: 'JOURNEE_GAIN',
  recommendedPlan: 'BASIQUE',
  allowedPlans: ['BASIQUE', 'MOYEN'],
  accountingLevel: 1,
  planningType: 'GAIN_SIMPLE',
  expertPriority: 'LOW',
  options: {
    accountingFiscality: 'LIGHT',
    financialPlanning: 'CONTEXTUAL',
    expertAssistance: 'CONTEXTUAL',
  },
  modulesMasques: ['cycle-production', 'lots-pertes', 'fiscalite-avancee'],
  expertTriggers: ['achat-equipement', 'demande-credit', 'fiscalite-simple'],
  upgradeTriggers: ['stock', 'clients', 'fournisseurs', 'documents', 'commandes'],
  planFeatures: {
    basique: 'CARNET_SIMPLE',
    moyen: 'MODULES_STANDARD',
    eleve: 'NON_RECOMMANDE',
  },
};

const MEDIUM_PROFILE: SegmentationProfile = {
  optionFamily: 'TOUTES_OPTIONS',
  economicUnit: 'COMMANDE_OU_STOCK',
  recommendedPlan: 'MOYEN',
  allowedPlans: ['MOYEN', 'ELEVE'],
  accountingLevel: 2,
  planningType: 'MARGE_ET_TRESORERIE',
  expertPriority: 'MEDIUM',
  options: {
    accountingFiscality: 'REQUIRED',
    financialPlanning: 'STRONG',
    expertAssistance: 'STRONG',
  },
  modulesMasques: ['cycle-production-avance', 'lots-pertes-avance'],
  expertTriggers: ['marge-faible', 'documents-pro', 'demande-credit', 'fiscalite-simple'],
  upgradeTriggers: ['cycles', 'lots', 'pertes-dlc', 'bilan', 'pret-microfinance'],
  planFeatures: {
    basique: 'NON_RECOMMANDE',
    moyen: 'MODULES_STANDARD',
    eleve: 'MODULES_AVANCES_PLUS_EXPERT',
  },
};

const HIGH_PROFILE: SegmentationProfile = {
  optionFamily: 'TOUTES_OPTIONS',
  economicUnit: 'CYCLE_LOT_CAMPAGNE',
  recommendedPlan: 'ELEVE',
  allowedPlans: ['MOYEN', 'ELEVE'],
  accountingLevel: 4,
  planningType: 'PLANIFICATION_AVANCEE',
  expertPriority: 'HIGH',
  options: {
    accountingFiscality: 'REQUIRED',
    financialPlanning: 'REQUIRED',
    expertAssistance: 'STRONG',
  },
  modulesMasques: ['prestations-simples'],
  expertTriggers: [
    'marge-negative',
    'pertes-elevees',
    'cout-revient-incertain',
    'demande-credit',
    'bilan',
  ],
  upgradeTriggers: ['cycles', 'lots', 'campagnes', 'pertes-dlc', 'amortissements', 'bilan'],
  planFeatures: {
    basique: 'NON_RECOMMANDE',
    moyen: 'MODULES_STANDARD',
    eleve: 'MODULES_AVANCES_PLUS_EXPERT',
  },
};

export const SEGMENTATION_BY_SLUG: Record<string, SegmentationProfile> = {
  boulanger: {
    ...MEDIUM_PROFILE,
    economicUnit: 'JOURNEE_TRESORERIE',
    planningType: 'CASH_DEMAIN',
    upgradeTriggers: ['creances', 'stock-bas', 'financement', 'bilan'],
  },
  restaurant: {
    ...MEDIUM_PROFILE,
    economicUnit: 'JOURNEE_TRESORERIE',
    planningType: 'CASH_ET_STOCK_JOUR',
  },
  couturier: {
    ...MEDIUM_PROFILE,
    economicUnit: 'COMMANDE',
    planningType: 'MARGE_PAR_COMMANDE',
  },
  epicerie: {
    ...MEDIUM_PROFILE,
    economicUnit: 'STOCK_ROTATION',
    planningType: 'REAPPROVISIONNEMENT',
  },
  coiffeur: {
    ...MEDIUM_PROFILE,
    economicUnit: 'PRESTATION_ET_PRODUITS',
    planningType: 'MARGE_PRESTATION',
    allowedPlans: ['BASIQUE', 'MOYEN', 'ELEVE'],
  },
  patisserie: {
    ...MEDIUM_PROFILE,
    economicUnit: 'RECETTE_COMMANDE',
    accountingLevel: 3,
    planningType: 'PRIX_MINIMUM_RECETTE',
    upgradeTriggers: ['pertes-dlc', 'equipements', 'commandes-nombreuses', 'bilan'],
  },
  vendeur_huile: {
    ...MEDIUM_PROFILE,
    economicUnit: 'STOCK_MARGE',
    planningType: 'STOCK_ET_CREANCES',
  },
  elevage: {
    ...HIGH_PROFILE,
    economicUnit: 'BANDE',
    planningType: 'COUT_PAR_LOT',
    expertTriggers: ['mortalite-elevee', 'cout-revient-incertain', 'demande-credit', 'bilan'],
  },
  agriculture: {
    ...HIGH_PROFILE,
    economicUnit: 'CAMPAGNE',
    planningType: 'BUDGET_CAMPAGNE',
    expertTriggers: ['credit-campagne', 'subvention', 'amortissements', 'bilan'],
  },
  riziculture: {
    ...HIGH_PROFILE,
    economicUnit: 'CAMPAGNE_RIZ',
    planningType: 'BUDGET_CAMPAGNE_RIZ',
  },
  producteur_jus: {
    ...HIGH_PROFILE,
    economicUnit: 'LOT_PERISSABLE',
    accountingLevel: 3,
    planningType: 'COUT_PAR_LITRE',
    expertTriggers: ['pertes-dlc', 'depot-impaye', 'cout-revient-incertain', 'bilan'],
  },
  vente_en_ligne: {
    ...HIGH_PROFILE,
    economicUnit: 'ARTICLE_CANAL',
    accountingLevel: 5,
    planningType: 'MARGE_PAR_CANAL',
    expertTriggers: ['reconciliation-mobile-money', 'retours-eleves', 'fiscalite', 'bilan'],
  },
  transport: {
    ...BASIC_PROFILE,
    economicUnit: 'JOURNEE_EQUIPEMENT',
    planningType: 'GAIN_ET_MAINTENANCE',
  },
  mecanique: {
    ...BASIC_PROFILE,
    economicUnit: 'PRESTATION_EQUIPEMENT',
    planningType: 'GAIN_ET_OUTILS',
  },
  menuiserie: {
    ...BASIC_PROFILE,
    economicUnit: 'COMMANDE_SIMPLE',
    planningType: 'MARGE_SIMPLE_COMMANDE',
  },
  etudiant_revendeur: {
    ...BASIC_PROFILE,
    economicUnit: 'MICRO_CAPITAL',
    planningType: 'ROTATION_CAPITAL',
    options: {
      accountingFiscality: 'LIGHT',
      financialPlanning: 'STRONG',
      expertAssistance: 'CONTEXTUAL',
    },
    upgradeTriggers: ['stock-multi-produits', 'fournisseurs', 'activite-qui-grandit'],
  },
};

export function getSegmentationForMetier(
  slug: string,
  profil: string,
): SegmentationProfile {
  if (SEGMENTATION_BY_SLUG[slug]) {
    return SEGMENTATION_BY_SLUG[slug];
  }

  if (profil === 'PRESTATAIRE') return BASIC_PROFILE;
  if (profil === 'PRODUCTEUR') return MEDIUM_PROFILE;
  return MEDIUM_PROFILE;
}

export function getSubscriptionPlan(code: PlanCode): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((plan) => plan.code === code) ?? SUBSCRIPTION_PLANS[1];
}

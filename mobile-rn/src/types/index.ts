// C'PRO — TypeScript Types

export type TransactionType = 'recette' | 'depense';

export type ModePaiement = 'especes' | 'mobile_money' | 'credit';

export type DocumentType = 'devis' | 'facture' | 'contrat' | 'rh';

export type Metier =
  | 'boulanger'
  | 'restaurant'
  | 'elevage'
  | 'agriculture'
  | 'riziculture'
  | 'couturier'
  | 'coiffeur'
  | 'epicerie'
  | 'patisserie'
  | 'vendeur_huile'
  | 'vente_en_ligne'
  | 'producteur_jus'
  | 'mecanique'
  | 'menuiserie'
  | 'transport'
  | 'etudiant_revendeur'
  | 'marichere'
  | 'zemitadjan'
  | 'couturiere'
  | 'restauratrice'
  | 'eleveur_volailles'
  | 'vendeuse_boissons'
  | 'mecanicien'
  | 'commercante_tissus'
  | 'coiffeur'
  | 'gerant_kiosque'
  | 'autre';

export type ModeFinancement = 'fonds_propres' | 'emprunt' | 'tontine' | 'mixte';

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

export interface ProfileDashboardConfig {
  profil: string;
  dashboardType: string;
  optionFamily: OptionFamily;
  economicUnit: string;
  recommendedPlan: PlanCode;
  allowedPlans: PlanCode[];
  besoinFinancement: string;
  typeFinancement: string[];
  frequenceCash: string;
  modulesActifs: string[];
  modulesMasques: string[];
  alertesActives: string[];
  margeTypique: number | null;
  cycleVenteJours: number | null;
  accountingLevel: 1 | 2 | 3 | 4 | 5;
  planningType: string;
  expertPriority: ExpertPriority;
  options: {
    accountingFiscality: OptionAccess;
    financialPlanning: OptionAccess;
    expertAssistance: OptionAccess;
  };
  planFeatures: Record<Lowercase<PlanCode>, string>;
  expertTriggers: string[];
  upgradeTriggers: string[];
  subscription: {
    currentPlan: SubscriptionPlan;
    allPlans: SubscriptionPlan[];
  };
  metier: {
    slug: string;
    nom: string;
    icon: string | null;
    description: string | null;
  };
  features: {
    showFinancementSection: boolean;
    showStockModule: boolean;
    showCommandesModule: boolean;
    showEquipementsModule: boolean;
    showClientsModule: boolean;
    showFournisseursModule: boolean;
    showTresorerieAlert: boolean;
    showStockAlert: boolean;
    showCreditAlert: boolean;
    showComptabiliteFiscalite: boolean;
    showFinancialPlanning: boolean;
    showExpertAssistance: boolean;
    showAdvancedPlanning: boolean;
    showDocumentsModule: boolean;
    showSubscriptionUpgrade: boolean;
  };
  ui: {
    dashboardLayout: string;
    primaryColor: string;
    profilLabel: string;
    profilDescription: string;
  };
}

export interface UserProfile {
  userId: string;
  nom: string;
  metier: Metier;
  lieu: string;
  capitalDepart: number;
  modeFinancement: ModeFinancement;
  devise: 'XOF';
  photoUrl?: string | null;
  logoUrl?: string | null;
  logoPreset?: string | null;
  createdAt: string;
}

export interface Transaction {
  txId: string;
  userId: string;
  type: TransactionType;
  montant: number;
  categorie: string;
  sousCategorie?: string;
  modePaiement: ModePaiement;
  date: string;
  notes?: string;
  quantite?: number;
  prixUnitaire?: number;
  client?: string;
  synced: boolean;
  createdAt: string;
}

export interface Equipment {
  equipId: string;
  userId: string;
  nom: string;
  valeurAchat: number;
  dureeVieAns: number;
  dateAchat: string;
  amortissementQuotidien: number;
}

export interface Document {
  docId: string;
  userId: string;
  type: DocumentType;
  titre: string;
  client?: {
    nom: string;
    adresse?: string;
    telephone?: string;
  };
  lignes: {
    designation: string;
    quantite: number;
    prixUnitaire: number;
    details?: string;
  }[];
  totalHT: number;
  tva: number;
  totalTTC: number;
  statut: 'brouillon' | 'valide' | 'envoye';
  createdAt: string;
}

export interface FinancialGoal {
  goalId: string;
  userId: string;
  montantCible: number;
  epargneParMois: number;
  dateObjectif: string;
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: 'transaction' | 'profile' | 'equipment';
  payload: Record<string, unknown>;
  synced: boolean;
  createdAt: string;
}

export interface DashboardIndicators {
  chiffreAffaires: number;
  resultatNet: number;
  tauxProfitabilite: number;
  tresorerieNette: number;
  ratioChargesCA: number;
  progressionObjectif: number;
  seuilRentabilite: number;
  joursAvantSR: number;
}

export interface IMFInstitution {
  id: string;
  nom: string;
  type: string;
  localisation: string;
  tauxInteret: string;
  montantMin: number;
  montantMax: number;
  dureeMax: string;
  contact: string;
}

export interface GlossaireEntry {
  id: string;
  terme: string;
  definition: string;
  exemple: string;
  formule?: string;
}

export interface ExpertRequest {
  id: string;
  userId: string;
  reason: string;
  details?: string;
  planCode: PlanCode;
  metierSlug?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | string;
  contextJson?: string;
  createdAt: string;
  updatedAt: string;
}

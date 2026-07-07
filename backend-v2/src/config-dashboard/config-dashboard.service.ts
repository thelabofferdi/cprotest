import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  getSegmentationForMetier,
  getSubscriptionPlan,
  SUBSCRIPTION_PLANS,
  type ExpertPriority,
  type OptionAccess,
  type OptionFamily,
  type PlanCode,
  type SubscriptionPlan,
} from './segmentation.config';

export interface DashboardConfig {
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
    dashboardLayout:
      | 'tresorerie'
      | 'benefice'
      | 'simple'
      | 'cycle'
      | 'saison'
      | 'commande_marge'
      | 'omnicanal'
      | 'lot_peremption'
      | 'micro_capital';
    primaryColor: string;
    profilLabel: string;
    profilDescription: string;
  };
}

@Injectable()
export class ConfigDashboardService {
  constructor(private prisma: PrismaService) {}

  async getMyDashboardConfig(userId: string): Promise<DashboardConfig> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profil utilisateur non trouvé');
    }

    const metier = await this.prisma.metier.findUnique({
      where: { slug: profile.metierSlug },
    });

    if (!metier) {
      throw new NotFoundException(`Métier "${profile.metierSlug}" non trouvé`);
    }

    return this.buildDashboardConfig(metier);
  }

  async getMetierConfig(metierSlug: string): Promise<DashboardConfig | null> {
    const metier = await this.prisma.metier.findUnique({
      where: { slug: metierSlug },
    });

    if (!metier) {
      return null;
    }

    return this.buildDashboardConfig(metier);
  }

  getSubscriptionPlans(): SubscriptionPlan[] {
    return SUBSCRIPTION_PLANS;
  }

  private buildDashboardConfig(metier: {
    slug: string;
    nom: string;
    icon: string | null;
    description: string | null;
    profil: string;
    dashboardType: string;
    besoinFinancement: string;
    typeFinancement: string | null;
    frequenceCash: string;
    modulesActifs: string | null;
    alertesActives: string | null;
    margeTypique: number | null;
    cycleVenteJours: number | null;
  }): DashboardConfig {
    const modulesActifs = this.parseJsonArray(metier.modulesActifs);
    const alertesActives = this.parseJsonArray(metier.alertesActives);
    const typeFinancement = this.parseJsonArray(metier.typeFinancement);
    const segmentation = getSegmentationForMetier(metier.slug, metier.profil);
    const currentPlan = getSubscriptionPlan(segmentation.recommendedPlan);

    const features = {
      showFinancementSection: metier.besoinFinancement !== 'FAIBLE',
      showStockModule: modulesActifs.includes('stock'),
      showCommandesModule: modulesActifs.includes('commandes'),
      showEquipementsModule: modulesActifs.includes('equipements'),
      showClientsModule: modulesActifs.includes('clients'),
      showFournisseursModule: modulesActifs.includes('fournisseurs'),
      showTresorerieAlert: alertesActives.includes('tresorerie-basse'),
      showStockAlert: alertesActives.includes('stock-bas'),
      showCreditAlert: alertesActives.includes('credit-client'),
      showComptabiliteFiscalite: segmentation.options.accountingFiscality !== 'LIGHT',
      showFinancialPlanning: segmentation.options.financialPlanning !== 'CONTEXTUAL',
      showExpertAssistance: segmentation.expertPriority !== 'LOW',
      showAdvancedPlanning: segmentation.recommendedPlan === 'ELEVE',
      showDocumentsModule: segmentation.recommendedPlan !== 'BASIQUE',
      showSubscriptionUpgrade: segmentation.allowedPlans.length > 1,
    };

    const ui = this.getUIConfig(metier.profil, metier.dashboardType);

    return {
      profil: metier.profil,
      dashboardType: metier.dashboardType,
      optionFamily: segmentation.optionFamily,
      economicUnit: segmentation.economicUnit,
      recommendedPlan: segmentation.recommendedPlan,
      allowedPlans: segmentation.allowedPlans,
      besoinFinancement: metier.besoinFinancement,
      typeFinancement,
      frequenceCash: metier.frequenceCash,
      modulesActifs,
      modulesMasques: segmentation.modulesMasques,
      alertesActives,
      margeTypique: metier.margeTypique,
      cycleVenteJours: metier.cycleVenteJours,
      accountingLevel: segmentation.accountingLevel,
      planningType: segmentation.planningType,
      expertPriority: segmentation.expertPriority,
      options: segmentation.options,
      planFeatures: segmentation.planFeatures,
      expertTriggers: segmentation.expertTriggers,
      upgradeTriggers: segmentation.upgradeTriggers,
      subscription: {
        currentPlan,
        allPlans: SUBSCRIPTION_PLANS,
      },
      metier: {
        slug: metier.slug,
        nom: metier.nom,
        icon: metier.icon,
        description: metier.description,
      },
      features,
      ui,
    };
  }

  private parseJsonArray(jsonString: string | null): string[] {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  }

  private getUIConfig(
    profil: string,
    dashboardType: string,
  ): DashboardConfig['ui'] {
    const profilConfigs: Record<
      string,
      { label: string; description: string; color: string }
    > = {
      PRODUCTEUR: {
        label: 'Producteur',
        description:
          'Votre activité nécessite une gestion fine de la trésorerie et des achats de matières premières',
        color: '#E53935',
      },
      COMMERCANT: {
        label: 'Commerçant',
        description:
          "Suivez vos marges et bénéfices pour optimiser votre activité d'achat-revente",
        color: '#FB8C00',
      },
      PRESTATAIRE: {
        label: 'Prestataire',
        description:
          'Gérez simplement vos revenus et charges avec un suivi de vos équipements',
        color: '#43A047',
      },
      ELEVEUR: {
        label: 'Eleveur',
        description:
          'Pilotez vos bandes, pertes, aliments et cout de revient par lot',
        color: '#6D4C41',
      },
      AGRICULTEUR: {
        label: 'Agriculteur',
        description:
          'Suivez vos campagnes, intrants, recoltes et besoins de financement',
        color: '#7CB342',
      },
    };

    const config = profilConfigs[profil] || profilConfigs.COMMERCANT;

    return {
      dashboardLayout: dashboardType.toLowerCase() as DashboardConfig['ui']['dashboardLayout'],
      primaryColor: config.color,
      profilLabel: config.label,
      profilDescription: config.description,
    };
  }
}

import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ConfigDashboardService } from './config-dashboard.service';

@Controller('config')
export class ConfigDashboardController {
  constructor(private configDashboardService: ConfigDashboardService) {}

  @UseGuards(JwtAuthGuard)
  @Get('my-dashboard')
  async getMyDashboard(@Request() req: { user: { sub: string } }) {
    return this.configDashboardService.getMyDashboardConfig(req.user.sub);
  }

  @Get('subscription-plans')
  async getSubscriptionPlans() {
    return this.configDashboardService.getSubscriptionPlans();
  }

  @Get('metier/:slug')
  async getMetierConfig(@Param('slug') slug: string) {
    const config = await this.configDashboardService.getMetierConfig(slug);
    if (!config) {
      return { error: 'Métier non trouvé', slug };
    }
    return config;
  }

  @Get('metiers-par-profil')
  async getAllMetiersConfig() {
    const metiers = [
      'boulanger',
      'restaurant',
      'elevage',
      'agriculture',
      'couturier',
      'coiffeur',
      'epicerie',
      'patisserie',
      'vendeur_huile',
      'producteur_jus',
      'vente_en_ligne',
      'riziculture',
      'etudiant_revendeur',
      'mecanique',
      'menuiserie',
      'transport',
    ];

    const configs = await Promise.all(
      metiers.map((slug) => this.configDashboardService.getMetierConfig(slug)),
    );

    return {
      producteurs: configs.filter((c) => c?.profil === 'PRODUCTEUR'),
      commercants: configs.filter((c) => c?.profil === 'COMMERCANT'),
      prestataires: configs.filter((c) => c?.profil === 'PRESTATAIRE'),
    };
  }
}

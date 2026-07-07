import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // GET /config/metiers
  @Get('metiers')
  async getAllMetiers() {
    return this.configService.getAllMetiers();
  }

  // GET /config/metiers/:slug
  @Get('metiers/:slug')
  async getMetierBySlug(@Param('slug') slug: string) {
    const metier = await this.configService.getMetierBySlug(slug);
    if (!metier) {
      throw new NotFoundException(`Métier "${slug}" non trouvé`);
    }
    return metier;
  }

  // GET /config/metiers/:slug/categories
  @Get('metiers/:slug/categories')
  async getCategoriesByMetier(@Param('slug') slug: string) {
    const result = await this.configService.getCategoriesByMetier(slug);
    if (!result) {
      throw new NotFoundException(`Métier "${slug}" non trouvé`);
    }
    return result;
  }

  // GET /config/amortissements
  @Get('amortissements')
  async getAllAmortissements() {
    return this.configService.getAllAmortissements();
  }

  // GET /config/amortissements/:slug
  @Get('amortissements/:slug')
  async getAmortissementBySlug(@Param('slug') slug: string) {
    const type = await this.configService.getAmortissementBySlug(slug);
    if (!type) {
      throw new NotFoundException(`Type amortissement "${slug}" non trouvé`);
    }
    return type;
  }
}

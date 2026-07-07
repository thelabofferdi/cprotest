import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AcademyService } from './academy.service';

@Controller('academy')
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  // GET /academy/glossaire?categorie=comptabilite
  @Get('glossaire')
  async getAllGlossaire(@Query('categorie') categorie?: string) {
    return this.academyService.getAllGlossaire(categorie);
  }

  // GET /academy/glossaire/:terme
  @Get('glossaire/:terme')
  async getTermeBySlug(@Param('terme') terme: string) {
    const result = await this.academyService.getTermeBySlug(terme);
    if (!result) {
      throw new NotFoundException(`Terme "${terme}" non trouvé`);
    }
    return result;
  }

  // GET /academy/fiches?categorie=compta-base
  @Get('fiches')
  async getAllFiches(@Query('categorie') categorie?: string) {
    return this.academyService.getAllFiches(categorie);
  }

  // GET /academy/fiches/:slug
  @Get('fiches/:slug')
  async getFicheBySlug(@Param('slug') slug: string) {
    const result = await this.academyService.getFicheBySlug(slug);
    if (!result) {
      throw new NotFoundException(`Fiche "${slug}" non trouvée`);
    }
    return result;
  }
}

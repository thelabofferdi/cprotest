import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { FinancingService } from './financing.service';

@Controller('financing')
export class FinancingController {
  constructor(private readonly financingService: FinancingService) {}

  // GET /financing?ville=Cotonou&type=imf
  @Get()
  async getAllIMF(
    @Query('ville') ville?: string,
    @Query('type') type?: string,
  ) {
    return this.financingService.getAllIMF({ ville, type });
  }

  // GET /financing/:slug
  @Get(':slug')
  async getIMFBySlug(@Param('slug') slug: string) {
    const result = await this.financingService.getIMFBySlug(slug);
    if (!result) {
      throw new NotFoundException(`IMF "${slug}" non trouvée`);
    }
    return result;
  }
}

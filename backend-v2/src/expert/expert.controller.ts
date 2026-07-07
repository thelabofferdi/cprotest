import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateExpertRequestDto } from './dto/create-expert-request.dto';
import { ExpertService } from './expert.service';

@UseGuards(JwtAuthGuard)
@Controller('expert-requests')
export class ExpertController {
  constructor(private readonly expertService: ExpertService) {}

  @Post()
  async create(
    @Request() req: { user: { sub: string } },
    @Body() dto: CreateExpertRequestDto,
  ) {
    return this.expertService.create(req.user.sub, dto);
  }

  @Get()
  async findMine(@Request() req: { user: { sub: string } }) {
    return this.expertService.findMine(req.user.sub);
  }
}

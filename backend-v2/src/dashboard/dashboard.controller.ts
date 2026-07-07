import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { GetDashboardDto } from './dto';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  async getDashboard(
    @CurrentUser('id') userId: string,
    @Query() query: Omit<GetDashboardDto, 'userId'>,
  ) {
    return this.dashboardService.getDashboard({
      userId,
      ...query,
    });
  }
}

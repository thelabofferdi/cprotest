import { Module } from '@nestjs/common';
import { ConfigDashboardController } from './config-dashboard.controller';
import { ConfigDashboardService } from './config-dashboard.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ConfigDashboardController],
  providers: [ConfigDashboardService],
  exports: [ConfigDashboardService],
})
export class ConfigDashboardModule {}

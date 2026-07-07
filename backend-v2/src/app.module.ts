import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EquipmentsModule } from './equipments/equipments.module';
import { ClientsModule } from './clients/clients.module';
import { ProfileModule } from './profile/profile.module';
import { AppConfigModule } from './config/config.module';
import { AcademyModule } from './academy/academy.module';
import { FinancingModule } from './financing/financing.module';
import { UploadModule } from './upload/upload.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigDashboardModule } from './config-dashboard/config-dashboard.module';
import { ExpertModule } from './expert/expert.module';
import { OcrService } from './ocr/ocr.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    DashboardModule,
    TransactionsModule,
    EquipmentsModule,
    ClientsModule,
    ProfileModule,
    AppConfigModule,
    AcademyModule,
    FinancingModule,
    UploadModule,
    NotificationsModule,
    ConfigDashboardModule,
    ExpertModule,
  ],
  controllers: [AppController],
  providers: [AppService, OcrService],
})
export class AppModule {}

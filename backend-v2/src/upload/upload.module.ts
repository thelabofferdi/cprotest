import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OcrService } from '../ocr/ocr.service';

@Module({
  imports: [PrismaModule],
  providers: [UploadService, OcrService],
  controllers: [UploadController],
  exports: [UploadService, OcrService],
})
export class UploadModule {}

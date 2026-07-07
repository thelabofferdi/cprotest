import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { UploadService } from './upload.service';
import { OcrService } from '../ocr/ocr.service';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly ocrService: OcrService,
  ) {}

  // POST /upload/profile-photo
  @Post('profile-photo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.',
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadProfilePhoto(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return this.uploadService.uploadProfilePhoto(userId, file);
  }

  // POST /upload/logo
  @Post('logo')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.',
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadLogo(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return this.uploadService.uploadLogo(userId, file);
  }

  // POST /upload/momo-sms - Analyser SMS Mobile Money avec OCR
  @Post('momo-sms')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.',
            ),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async analyzeMomoSms(
    @CurrentUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // 1. Sauvegarder l'image
    const filename = `momo-${userId}-${Date.now()}.webp`;
    const filepath = `uploads/proofs/${filename}`;

    const sharp = require('sharp');
    const fs = require('fs/promises');
    const path = require('path');

    await fs.mkdir(path.dirname(filepath), { recursive: true });

    await sharp(file.buffer)
      .resize(1200, null, { fit: 'inside' }) // Garder bonne résolution pour OCR
      .webp({ quality: 90 })
      .toFile(filepath);

    // 2. Analyser avec OCR
    const ocrData = await this.ocrService.extractMomoData(filepath);

    // 3. Retourner les données + URL image
    return {
      ...ocrData,
      proofImageUrl: `/${filepath}`,
    };
  }
}

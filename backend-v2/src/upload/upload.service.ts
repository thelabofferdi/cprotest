import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');

  constructor(private prisma: PrismaService) {}

  // Upload photo de profil
  async uploadProfilePhoto(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const filename = `profile-${userId}-${Date.now()}.webp`;
    const filepath = path.join(this.uploadsDir, 'profiles', filename);

    // Optimiser l'image: resize + compression WebP
    await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(filepath);

    const url = `/uploads/profiles/${filename}`;

    // Mettre à jour le profil utilisateur
    await this.prisma.profile.updateMany({
      where: { userId },
      data: { photoUrl: url },
    });

    return { url };
  }

  // Upload logo entreprise
  async uploadLogo(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string }> {
    const filename = `logo-${userId}-${Date.now()}.webp`;
    const filepath = path.join(this.uploadsDir, 'logos', filename);

    // Optimiser: resize carré + compression
    await sharp(file.buffer)
      .resize(300, 300, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .webp({ quality: 85 })
      .toFile(filepath);

    const url = `/uploads/logos/${filename}`;

    // Mettre à jour le profil
    await this.prisma.profile.updateMany({
      where: { userId },
      data: { logoUrl: url },
    });

    return { url };
  }

  // Validation fichier image
  validateImageFile(file: Express.Multer.File): void {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.',
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException(
        'Fichier trop volumineux. Maximum 5MB.',
      );
    }
  }

  // Supprimer ancien fichier
  async deleteFile(fileUrl: string): Promise<void> {
    if (!fileUrl) return;

    const filepath = path.join(process.cwd(), fileUrl);
    try {
      await fs.unlink(filepath);
    } catch (error) {
      // Fichier déjà supprimé ou inexistant
      console.warn(`Impossible de supprimer ${filepath}:`, error.message);
    }
  }
}

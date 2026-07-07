import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateProfileDto) {
    // Vérifier si le profil existe déjà
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Un profil existe déjà pour cet utilisateur');
    }

    return this.prisma.profile.create({
      data: {
        userId,
        ...createDto,
      },
    });
  }

  async findOne(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profil non trouvé');
    }

    return profile;
  }

  async update(userId: string, updateDto: UpdateProfileDto) {
    await this.findOne(userId);

    return this.prisma.profile.update({
      where: { userId },
      data: updateDto,
    });
  }

  async upsert(userId: string, data: CreateProfileDto) {
    return this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  }
}

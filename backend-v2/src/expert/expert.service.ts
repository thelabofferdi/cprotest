import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getSegmentationForMetier } from '../config-dashboard/segmentation.config';
import { CreateExpertRequestDto } from './dto/create-expert-request.dto';

@Injectable()
export class ExpertService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpertRequestDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    const metier = profile?.metierSlug
      ? await this.prisma.metier.findUnique({ where: { slug: profile.metierSlug } })
      : null;
    const segmentation = metier
      ? getSegmentationForMetier(metier.slug, metier.profil)
      : null;

    return this.prisma.expertRequest.create({
      data: {
        userId,
        reason: dto.reason,
        details: dto.details,
        metierSlug: profile?.metierSlug,
        planCode: segmentation?.recommendedPlan ?? 'BASIQUE',
        contextJson: JSON.stringify({
          ...(dto.context ?? {}),
          profil: metier?.profil,
          metier: metier?.slug,
          recommendedPlan: segmentation?.recommendedPlan,
          expertPriority: segmentation?.expertPriority,
          expertTriggers: segmentation?.expertTriggers,
        }),
      },
    });
  }

  async findMine(userId: string) {
    return this.prisma.expertRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface GetImfFilters {
  ville?: string;
  type?: string;
}

@Injectable()
export class FinancingService {
  constructor(private prisma: PrismaService) {}

  async getAllIMF(filters?: GetImfFilters) {
    return this.prisma.iMF.findMany({
      where: {
        actif: true,
        ...(filters?.ville && { ville: filters.ville }),
        ...(filters?.type && { type: filters.type }),
      },
      select: {
        id: true,
        slug: true,
        nom: true,
        sigle: true,
        type: true,
        ville: true,
        quartier: true,
        telephone: true,
        services: true,
        montantMin: true,
        montantMax: true,
        tauxInteret: true,
      },
      orderBy: { ordre: 'asc' },
    });
  }

  async getIMFBySlug(slug: string) {
    return this.prisma.iMF.findUnique({
      where: { slug },
    });
  }
}

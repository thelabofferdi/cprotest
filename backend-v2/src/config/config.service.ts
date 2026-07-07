import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

  // === MÉTIERS ===

  async getAllMetiers() {
    return this.prisma.metier.findMany({
      where: { actif: true },
      include: {
        categories: {
          where: { actif: true },
          orderBy: { ordre: 'asc' },
        },
      },
      orderBy: { ordre: 'asc' },
    });
  }

  async getMetierBySlug(slug: string) {
    return this.prisma.metier.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { actif: true },
          orderBy: { ordre: 'asc' },
        },
      },
    });
  }

  // === TYPES AMORTISSEMENT ===

  async getAllAmortissements() {
    return this.prisma.typeAmortissement.findMany({
      where: { actif: true },
      orderBy: { ordre: 'asc' },
    });
  }

  async getAmortissementBySlug(slug: string) {
    return this.prisma.typeAmortissement.findUnique({
      where: { slug },
    });
  }

  // === CATÉGORIES PAR MÉTIER ===

  async getCategoriesByMetier(metierSlug: string) {
    const metier = await this.prisma.metier.findUnique({
      where: { slug: metierSlug },
      include: {
        categories: {
          where: { actif: true },
          orderBy: { ordre: 'asc' },
        },
      },
    });

    if (!metier) {
      return null;
    }

    return {
      metier: {
        slug: metier.slug,
        nom: metier.nom,
      },
      revenus: metier.categories.filter((c) => c.type === 'REVENU'),
      charges: metier.categories.filter((c) => c.type === 'CHARGE'),
    };
  }
}

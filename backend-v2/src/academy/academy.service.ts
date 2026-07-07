import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademyService {
  constructor(private prisma: PrismaService) {}

  // === GLOSSAIRE ===

  async getAllGlossaire(categorie?: string) {
    return this.prisma.termeGlossaire.findMany({
      where: {
        actif: true,
        ...(categorie && { categorie }),
      },
      orderBy: { terme: 'asc' },
    });
  }

  async getTermeBySlug(terme: string) {
    return this.prisma.termeGlossaire.findUnique({
      where: { terme },
    });
  }

  // === FICHES PÉDAGOGIQUES ===

  async getAllFiches(categorie?: string) {
    return this.prisma.fichePedagogique.findMany({
      where: {
        actif: true,
        ...(categorie && { categorie }),
      },
      select: {
        id: true,
        slug: true,
        titre: true,
        description: true,
        categorie: true,
        duree: true,
        ordre: true,
        // Exclure le contenu complet pour la liste
      },
      orderBy: { ordre: 'asc' },
    });
  }

  async getFicheBySlug(slug: string) {
    return this.prisma.fichePedagogique.findUnique({
      where: { slug },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateEquipmentDto) {
    // Calcul automatique des amortissements
    const amortAnnuel = createDto.valeurAchat / createDto.dureeVieAns;
    const amortMensuel = amortAnnuel / 12;
    const amortJournalier = amortAnnuel / 365;

    // Calculer la valeur résiduelle actuelle
    const dateAchat = new Date(createDto.dateAchat);
    const now = new Date();
    const yearsElapsed = (now.getTime() - dateAchat.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    const valeurResiduelle = Math.max(
      0,
      createDto.valeurAchat - (amortAnnuel * yearsElapsed)
    );

    return this.prisma.equipment.create({
      data: {
        userId,
        nom: createDto.nom,
        typeSlug: createDto.typeSlug,
        valeurAchat: createDto.valeurAchat,
        dureeVieAns: createDto.dureeVieAns,
        dateAchat: new Date(createDto.dateAchat),
        amortAnnuel: this.round(amortAnnuel),
        amortMensuel: this.round(amortMensuel),
        amortJournalier: this.round(amortJournalier),
        valeurResiduelle: this.round(valeurResiduelle),
        isActive: true,
      },
    });
  }

  async findAll(userId: string, isActive?: boolean) {
    const where: any = { userId };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.equipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { id, userId },
    });

    if (!equipment) {
      throw new NotFoundException(`Équipement ${id} non trouvé`);
    }

    return equipment;
  }

  async update(userId: string, id: string, updateDto: UpdateEquipmentDto) {
    await this.findOne(userId, id);

    // Si changement de valeur ou durée, recalculer amortissements
    const data: any = { ...updateDto };

    if (updateDto.valeurAchat || updateDto.dureeVieAns) {
      const equipment = await this.findOne(userId, id);
      const valeurAchat = updateDto.valeurAchat ?? equipment.valeurAchat;
      const dureeVieAns = updateDto.dureeVieAns ?? equipment.dureeVieAns;

      const amortAnnuel = valeurAchat / dureeVieAns;
      const amortMensuel = amortAnnuel / 12;
      const amortJournalier = amortAnnuel / 365;

      data.amortAnnuel = this.round(amortAnnuel);
      data.amortMensuel = this.round(amortMensuel);
      data.amortJournalier = this.round(amortJournalier);
    }

    if (updateDto.dateAchat) {
      data.dateAchat = new Date(updateDto.dateAchat);
    }

    return this.prisma.equipment.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    // Soft delete
    await this.prisma.equipment.update({
      where: { id },
      data: { isActive: false },
    });

    return { deleted: true, id };
  }

  private round(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}

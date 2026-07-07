import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetDashboardDto, PeriodEnum } from './dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(dto: GetDashboardDto) {
    const { userId, period = PeriodEnum.MONTH, startDate, endDate } = dto;

    // Calculer les dates de début et fin selon la période
    const { start, end } = this.calculateDateRange(period, startDate, endDate);

    // Récupérer toutes les données nécessaires
    const [transactions, equipments, profile] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
      this.prisma.equipment.findMany({
        where: {
          userId,
          isActive: true,
        },
      }),
      this.prisma.profile.findUnique({
        where: { userId },
      }),
    ]);

    // Calculer les indicateurs
    const revenus = this.calculateRevenus(transactions);
    const charges = this.calculateCharges(transactions, equipments);
    const beneficeNet = revenus.total - charges.total;
    const tauxMarge = revenus.total > 0 ? (beneficeNet / revenus.total) * 100 : 0;

    // Évolution (comparaison avec période précédente)
    const evolution = await this.calculateEvolution(userId, start, end, period);

    // Taux d'atteinte objectif
    const objectifCA = profile?.objectifCaMensuel || 0;
    const tauxAtteinte = objectifCA > 0 ? (revenus.total / objectifCA) * 100 : 0;

    return {
      periode: {
        debut: start.toISOString(),
        fin: end.toISOString(),
        type: period,
      },
      revenus: {
        total: this.round(revenus.total),
        ventes: this.round(revenus.ventes),
        services: this.round(revenus.services),
        autres: this.round(revenus.autres),
      },
      charges: {
        total: this.round(charges.total),
        fixes: this.round(charges.fixes),
        variables: this.round(charges.variables),
        amortissements: this.round(charges.amortissements),
      },
      benefice: {
        net: this.round(beneficeNet),
        tauxMarge: this.round(tauxMarge),
      },
      objectif: {
        montant: this.round(objectifCA),
        atteint: this.round(revenus.total),
        tauxAtteinte: this.round(tauxAtteinte),
        resteAFaire: this.round(Math.max(0, objectifCA - revenus.total)),
      },
      evolution: {
        ca: this.round(evolution.ca),
        benefice: this.round(evolution.benefice),
        charges: this.round(evolution.charges),
      },
      statistiques: {
        nbTransactions: transactions.length,
        nbVentes: transactions.filter((t) => t.type === 'VENTE').length,
        nbDepenses: transactions.filter((t) => t.type === 'DEPENSE').length,
        nbEquipements: equipments.length,
        ticketMoyen: transactions.length > 0
          ? this.round(revenus.total / transactions.filter((t) => t.type === 'VENTE').length)
          : 0,
      },
    };
  }

  private calculateDateRange(
    period: PeriodEnum,
    startDate?: string,
    endDate?: string,
  ): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (period === PeriodEnum.CUSTOM && startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }

    switch (period) {
      case PeriodEnum.DAY:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      case PeriodEnum.WEEK:
        const dayOfWeek = now.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        start = new Date(now);
        start.setDate(now.getDate() - diff);
        start.setHours(0, 0, 0, 0);
        break;
      case PeriodEnum.MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        break;
      case PeriodEnum.YEAR:
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    }

    return { start, end };
  }

  private calculateRevenus(transactions: any[]) {
    const ventes = transactions
      .filter((t) => t.type === 'VENTE')
      .reduce((sum, t) => sum + t.montant, 0);

    const services = transactions
      .filter((t) => t.type === 'SERVICE')
      .reduce((sum, t) => sum + t.montant, 0);

    const autres = transactions
      .filter((t) => t.type === 'REVENU' || t.type === 'AUTRE_REVENU')
      .reduce((sum, t) => sum + t.montant, 0);

    return {
      ventes,
      services,
      autres,
      total: ventes + services + autres,
    };
  }

  private calculateCharges(transactions: any[], equipments: any[]) {
    const depenses = transactions.filter((t) => t.type === 'DEPENSE');

    const fixes = depenses
      .filter((d) => d.categorie === 'FIXE' || d.categorie === 'CHARGE_FIXE')
      .reduce((sum, d) => sum + d.montant, 0);

    const variables = depenses
      .filter((d) => d.categorie === 'VARIABLE' || d.categorie === 'CHARGE_VARIABLE')
      .reduce((sum, d) => sum + d.montant, 0);

    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const amortissements = equipments.reduce((sum, e) => sum + (e.amortJournalier * daysInMonth), 0);

    return {
      fixes,
      variables,
      amortissements,
      total: fixes + variables + amortissements,
    };
  }

  private async calculateEvolution(
    userId: string,
    currentStart: Date,
    currentEnd: Date,
    period: PeriodEnum,
  ) {
    const diff = currentEnd.getTime() - currentStart.getTime();
    const previousEnd = new Date(currentStart.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - diff);

    const [currentTx, previousTx, equipments] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: currentStart, lte: currentEnd },
        },
      }),
      this.prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: previousStart, lte: previousEnd },
        },
      }),
      this.prisma.equipment.findMany({
        where: { userId, isActive: true },
      }),
    ]);

    const currentCA = this.calculateRevenus(currentTx).total;
    const previousCA = this.calculateRevenus(previousTx).total;
    const evolutionCA = previousCA > 0 ? ((currentCA - previousCA) / previousCA) * 100 : 0;

    const currentCharges = this.calculateCharges(currentTx, equipments).total;
    const previousCharges = this.calculateCharges(previousTx, equipments).total;
    const evolutionCharges = previousCharges > 0
      ? ((currentCharges - previousCharges) / previousCharges) * 100
      : 0;

    const currentBenefice = currentCA - currentCharges;
    const previousBenefice = previousCA - previousCharges;
    const evolutionBenefice = previousBenefice !== 0
      ? ((currentBenefice - previousBenefice) / Math.abs(previousBenefice)) * 100
      : 0;

    return {
      ca: evolutionCA,
      charges: evolutionCharges,
      benefice: evolutionBenefice,
    };
  }

  private round(value: number, decimals: number = 2): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}

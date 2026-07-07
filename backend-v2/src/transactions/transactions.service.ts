import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto, SyncTransactionsDto, QueryTransactionsDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async syncBatch(userId: string, syncDto: SyncTransactionsDto) {
    const results = await Promise.allSettled(
      syncDto.transactions.map((txDto) =>
        this.prisma.transaction.create({
          data: {
            userId,
            type: txDto.type,
            montant: txDto.montant,
            categorie: txDto.categorie,
            sousCategorie: txDto.sousCategorie,
            quantite: txDto.quantite,
            prixUnitaire: txDto.prixUnitaire,
            modePaiement: txDto.modePaiement,
            clientId: txDto.clientId,
            date: new Date(txDto.date),
            notes: txDto.notes,
            syncedAt: new Date(),
          },
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      total: syncDto.transactions.length,
      succeeded,
      failed,
      errors: results
        .filter((r) => r.status === 'rejected')
        .map((r: any) => r.reason?.message || 'Unknown error'),
    };
  }

  async findAll(userId: string, query: QueryTransactionsDto) {
    const where: any = { userId };

    if (query.type) where.type = query.type;
    if (query.categorie) where.categorie = query.categorie;
    if (query.clientId) where.clientId = query.clientId;
    if (query.startDate || query.endDate) {
      where.date = {};
      if (query.startDate) where.date.gte = new Date(query.startDate);
      if (query.endDate) where.date.lte = new Date(query.endDate);
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              nom: true,
              prenom: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    const limit = query.limit || 50;
    const offset = query.offset || 0;

    return {
      data: transactions,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  async findOne(userId: string, id: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        client: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} non trouvée`);
    }

    return transaction;
  }

  async remove(userId: string, id: string) {
    const transaction = await this.findOne(userId, id);
    await this.prisma.transaction.delete({
      where: { id: transaction.id },
    });
    return { deleted: true, id };
  }

  async getStats(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [transactions, totals] = await Promise.all([
      this.prisma.transaction.findMany({ where }),
      this.prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: { montant: true },
        _count: true,
      }),
    ]);

    const stats = {
      total: transactions.length,
      byType: totals.reduce((acc, t) => {
        acc[t.type] = {
          count: t._count,
          total: t._sum.montant || 0,
        };
        return acc;
      }, {} as any),
    };

    return stats;
  }
}

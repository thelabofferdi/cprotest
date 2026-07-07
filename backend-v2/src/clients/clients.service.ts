import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        userId,
        ...createDto,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.client.findMany({
      where: { userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, userId },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!client) {
      throw new NotFoundException(`Client ${id} non trouvé`);
    }

    return client;
  }

  async update(userId: string, id: string, updateDto: UpdateClientDto) {
    await this.findOne(userId, id);

    return this.prisma.client.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);

    await this.prisma.client.delete({
      where: { id },
    });

    return { deleted: true, id };
  }

  async getCredit(userId: string) {
    const clients = await this.prisma.client.findMany({
      where: {
        userId,
        soldeCredit: { gt: 0 },
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        telephone: true,
        soldeCredit: true,
        limitCredit: true,
      },
      orderBy: { soldeCredit: 'desc' },
    });

    const totalCredit = clients.reduce((sum, c) => sum + c.soldeCredit, 0);

    return {
      clients,
      total: totalCredit,
      count: clients.length,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreateNotificationDto {
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: any;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // Enregistrer un token push
  async registerPushToken(
    userId: string,
    token: string,
    platform: string,
    deviceId?: string,
  ) {
    return this.prisma.pushToken.upsert({
      where: { token },
      create: {
        userId,
        token,
        platform,
        deviceId,
      },
      update: {
        userId,
        active: true,
        platform,
        deviceId,
      },
    });
  }

  // Créer une notification (stockée en DB)
  async createNotification(data: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        body: data.body,
        type: data.type,
        data: data.data ? JSON.stringify(data.data) : null,
      },
    });

    // TODO: Envoyer la push notification via FCM
    // Pour l'instant, on stocke juste en DB

    return notification;
  }

  // Récupérer les notifications d'un user
  async getUserNotifications(userId: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Marquer comme lue
  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { read: true },
    });
  }

  // Marquer toutes comme lues
  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  // Compter les non-lues
  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}

import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // POST /notifications/register-token
  @Post('register-token')
  async registerToken(
    @CurrentUser('id') userId: string,
    @Body() body: { token: string; platform: string; deviceId?: string },
  ) {
    return this.notificationsService.registerPushToken(
      userId,
      body.token,
      body.platform,
      body.deviceId,
    );
  }

  // GET /notifications
  @Get()
  async getNotifications(@CurrentUser('id') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  // GET /notifications/unread-count
  @Get('unread-count')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  // PUT /notifications/:id/read
  @Put(':id/read')
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(userId, id);
  }

  // PUT /notifications/mark-all-read
  @Put('mark-all-read')
  async markAllAsRead(@CurrentUser('id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}

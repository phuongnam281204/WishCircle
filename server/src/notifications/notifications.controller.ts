import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationLogDocument } from './notification-log.schema';
import { NotificationsService } from './notifications.service';

/** Exposes mock SMS messages for development. */
@Controller('notifications')
export class NotificationsController {
  public constructor(private readonly notificationsService: NotificationsService) {}

  /** Returns recent mock SMS logs. */
  @Get()
  @UseGuards(JwtAuthGuard)
  public async listRecentMessages(): Promise<NotificationLogDocument[]> {
    return this.notificationsService.listRecentMessages();
  }
}

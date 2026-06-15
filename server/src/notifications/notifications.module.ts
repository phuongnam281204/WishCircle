import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationLog, NotificationLogSchema } from './notification-log.schema';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

/** Notification infrastructure module. */
@Module({
  controllers: [NotificationsController],
  exports: [NotificationsService],
  imports: [MongooseModule.forFeature([{ name: NotificationLog.name, schema: NotificationLogSchema }])],
  providers: [NotificationsService],
})
export class NotificationsModule {}

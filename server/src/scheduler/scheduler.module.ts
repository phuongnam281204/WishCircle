import { Module } from '@nestjs/common';
import { BirthdayPagesModule } from '../birthday-pages/birthday-pages.module';
import { GroupsModule } from '../groups/groups.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';

/** Cron job orchestration module. */
@Module({
  controllers: [SchedulerController],
  imports: [BirthdayPagesModule, GroupsModule, NotificationsModule, UsersModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}

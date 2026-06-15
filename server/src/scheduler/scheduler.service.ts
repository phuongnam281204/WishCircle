import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { APP_TIMEZONE, BIRTHDAY_DELIVERY_CRON, MORNING_REMINDER_CRON } from '../common/app.constants';
import { addDays, getDatePartsInTimezone } from '../common/date.util';
import { BirthdayPagesService } from '../birthday-pages/birthday-pages.service';
import { GroupsService } from '../groups/groups.service';
import { NotificationType } from '../notifications/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { UserDocument } from '../users/user.schema';
import { UsersService } from '../users/users.service';

/** Runs birthday reminder and delivery jobs. */
@Injectable()
export class SchedulerService {
  public constructor(
    private readonly birthdayPagesService: BirthdayPagesService,
    private readonly configService: ConfigService,
    private readonly groupsService: GroupsService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  /** Sends T-1 wish reminders for tomorrow's birthdays. */
  @Cron(MORNING_REMINDER_CRON, { timeZone: APP_TIMEZONE })
  public async sendTomorrowBirthdayReminders(): Promise<{ readonly sentCount: number }> {
    const tomorrow = addDays(new Date(), 1);
    const birthdayUsers = await this.usersService.listUsersByBirthdayDate(tomorrow);
    let sentCount = 0;
    for (const birthdayUser of birthdayUsers) {
      sentCount += await this.sendReminderForUser(birthdayUser);
    }
    return { sentCount };
  }

  /** Generates today's birthday pages and sends page links. */
  @Cron(BIRTHDAY_DELIVERY_CRON, { timeZone: APP_TIMEZONE })
  public async deliverTodayBirthdayPages(): Promise<{ readonly sentCount: number }> {
    const today = new Date();
    const birthdayYear = getDatePartsInTimezone(today, APP_TIMEZONE).year;
    const birthdayUsers = await this.usersService.listUsersByBirthdayDate(today);
    let sentCount = 0;
    for (const birthdayUser of birthdayUsers) {
      sentCount += await this.deliverPagesForUser(birthdayUser, birthdayYear);
    }
    return { sentCount };
  }

  private async sendReminderForUser(birthdayUser: UserDocument): Promise<number> {
    const birthdayYear = getDatePartsInTimezone(new Date(), APP_TIMEZONE).year;
    const groups = await this.groupsService.listGroupsByMember(birthdayUser._id.toString());
    let sentCount = 0;
    for (const group of groups) {
      for (const memberId of group.members) {
        if (memberId.toString() === birthdayUser._id.toString()) {
          continue;
        }
        const member = await this.usersService.getById(memberId.toString());
        const link = `${this.getClientUrl()}/write-wish/${group._id.toString()}/${birthdayUser._id.toString()}`;
        await this.notificationsService.sendSms({
          birthdayYear,
          groupId: group._id,
          message: `Sinh nhật ${birthdayUser.name ?? birthdayUser.phone} là ngày mai! Gửi lời chúc tại ${link}`,
          recipientPhone: member.phone,
          targetUserId: birthdayUser._id,
          type: NotificationType.WishReminder,
        });
        sentCount += 1;
      }
    }
    return sentCount;
  }

  private async deliverPagesForUser(birthdayUser: UserDocument, birthdayYear: number): Promise<number> {
    const groups = await this.groupsService.listGroupsByMember(birthdayUser._id.toString());
    let sentCount = 0;
    for (const group of groups) {
      const page = await this.birthdayPagesService.generateBirthdayPage(
        group._id.toString(),
        birthdayUser._id.toString(),
        birthdayYear,
      );
      const link = `${this.getClientUrl()}/b/${page.token}`;
      await this.notificationsService.sendSms({
        birthdayYear,
        groupId: group._id,
        message: `Chúc mừng sinh nhật ${birthdayUser.name ?? birthdayUser.phone}! Mở bất ngờ tại ${link}`,
        recipientPhone: birthdayUser.phone,
        targetUserId: birthdayUser._id,
        type: NotificationType.BirthdayPage,
      });
      sentCount += 1;
    }
    return sentCount;
  }

  private getClientUrl(): string {
    return this.configService.get<string>('CLIENT_URL', 'http://localhost:5173');
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationLog, NotificationLogDocument } from './notification-log.schema';
import { SendSmsInput } from './send-sms.input';

/** Mock SMS sender that records outbound messages in MongoDB. */
@Injectable()
export class NotificationsService {
  public constructor(
    @InjectModel(NotificationLog.name) private readonly notificationLogModel: Model<NotificationLogDocument>,
  ) {}

  /** Saves a mock SMS attempt and suppresses duplicate birthday notifications. */
  public async sendSms(input: SendSmsInput): Promise<NotificationLogDocument> {
    const existingLog = await this.notificationLogModel
      .findOne({
        birthdayYear: input.birthdayYear,
        groupId: input.groupId,
        recipientPhone: input.recipientPhone,
        targetUserId: input.targetUserId,
        type: input.type,
      })
      .exec();
    if (existingLog) {
      return existingLog;
    }
    return this.notificationLogModel.create(input);
  }

  /** Lists recent mock messages for local development. */
  public async listRecentMessages(): Promise<NotificationLogDocument[]> {
    return this.notificationLogModel.find().sort({ createdAt: -1 }).limit(50).exec();
  }
}

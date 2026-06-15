import { Types } from 'mongoose';
import { NotificationType } from './notification-type.enum';

export type SendSmsInput = {
  readonly birthdayYear?: number;
  readonly groupId?: Types.ObjectId;
  readonly message: string;
  readonly recipientPhone: string;
  readonly targetUserId?: Types.ObjectId;
  readonly type: NotificationType;
};

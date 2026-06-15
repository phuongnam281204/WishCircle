import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { NotificationType } from './notification-type.enum';

export type NotificationLogDocument = HydratedDocument<NotificationLog>;

/** Stores every outbound SMS attempt for dev verification and idempotency. */
@Schema({ timestamps: true })
export class NotificationLog {
  @Prop({ ref: 'User', type: Types.ObjectId })
  targetUserId?: Types.ObjectId;

  @Prop({ ref: 'Group', type: Types.ObjectId })
  groupId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  recipientPhone: string;

  @Prop({ enum: NotificationType, required: true, type: String })
  type: NotificationType;

  @Prop({ required: true })
  message: string;

  @Prop()
  birthdayYear?: number;
}

export const NotificationLogSchema = SchemaFactory.createForClass(NotificationLog);

NotificationLogSchema.index(
  { birthdayYear: 1, groupId: 1, recipientPhone: 1, targetUserId: 1, type: 1 },
  { unique: true, sparse: true },
);

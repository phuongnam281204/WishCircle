import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BirthdayPageDocument = HydratedDocument<BirthdayPage>;

/** Public birthday page generated from wishes for a group and recipient. */
@Schema({ timestamps: true })
export class BirthdayPage {
  readonly _id: Types.ObjectId;

  @Prop({ ref: 'User', required: true, type: Types.ObjectId })
  toUserId: Types.ObjectId;

  @Prop({ ref: 'Group', required: true, type: Types.ObjectId })
  groupId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ default: [], ref: 'Wish', type: [Types.ObjectId] })
  wishes: Types.ObjectId[];

  @Prop({ required: true })
  birthdayYear: number;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  viewCount: number;
}

export const BirthdayPageSchema = SchemaFactory.createForClass(BirthdayPage);

BirthdayPageSchema.index({ birthdayYear: 1, groupId: 1, toUserId: 1 }, { unique: true });

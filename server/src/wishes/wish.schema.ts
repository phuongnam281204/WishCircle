import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WishDocument = HydratedDocument<Wish>;

/** Wish and optional photo submitted for a recipient's birthday. */
@Schema({ timestamps: true })
export class Wish {
  readonly _id: Types.ObjectId;

  @Prop({ ref: 'Group', required: true, type: Types.ObjectId })
  groupId: Types.ObjectId;

  @Prop({ ref: 'User', required: true, type: Types.ObjectId })
  fromUserId: Types.ObjectId;

  @Prop({ ref: 'User', required: true, type: Types.ObjectId })
  toUserId: Types.ObjectId;

  @Prop({ maxlength: 2000, required: true, trim: true })
  message: string;

  @Prop({ trim: true })
  photoUrl?: string;

  @Prop({ default: false })
  isAnonymous: boolean;

  @Prop({ default: [] })
  reactions: { readonly type: string; readonly userId: Types.ObjectId }[];

  @Prop({ required: true })
  birthdayYear: number;
}

export const WishSchema = SchemaFactory.createForClass(Wish);

WishSchema.index({ birthdayYear: 1, fromUserId: 1, groupId: 1, toUserId: 1 }, { unique: true });

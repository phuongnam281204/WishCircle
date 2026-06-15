import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

/** Registered WishCircle member. */
@Schema({ timestamps: true })
export class User {
  readonly _id: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @Prop({ trim: true })
  name?: string;

  @Prop()
  birthday?: Date;

  @Prop({ default: [], ref: 'Group', type: [Types.ObjectId] })
  groups: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

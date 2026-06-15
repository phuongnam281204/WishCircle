import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GroupDocument = HydratedDocument<Group>;

/** Circle of members who can prepare birthday wishes for each other. */
@Schema({ timestamps: true })
export class Group {
  readonly _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ ref: 'User', required: true, type: Types.ObjectId })
  adminId: Types.ObjectId;

  @Prop({ default: [], ref: 'User', type: [Types.ObjectId] })
  members: Types.ObjectId[];

  @Prop({ required: true, unique: true, uppercase: true })
  inviteCode: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpCodeDocument = HydratedDocument<OtpCode>;

/** Short-lived OTP challenge for phone authentication. */
@Schema({ timestamps: true })
export class OtpCode {
  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true })
  hashedCode: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  consumedAt?: Date;
}

export const OtpCodeSchema = SchemaFactory.createForClass(OtpCode);

OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

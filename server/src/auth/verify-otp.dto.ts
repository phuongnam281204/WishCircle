import { IsPhoneNumber, IsString, Length } from 'class-validator';

/** Input for verifying a login OTP. */
export class VerifyOtpDto {
  @IsPhoneNumber('VN')
  readonly phone: string;

  @IsString()
  @Length(6, 6)
  readonly code: string;
}

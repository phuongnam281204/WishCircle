import { IsPhoneNumber } from 'class-validator';

/** Input for requesting a login OTP. */
export class RequestOtpDto {
  @IsPhoneNumber('VN')
  readonly phone: string;
}

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model } from 'mongoose';
import { MOCK_OTP_CODE, OTP_TTL_MINUTES } from '../common/app.constants';
import { NotificationType } from '../notifications/notification-type.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { UserDocument } from '../users/user.schema';
import { UsersService } from '../users/users.service';
import { AuthResponse } from './auth-response.type';
import { OtpCode, OtpCodeDocument } from './otp-code.schema';

const BCRYPT_SALT_ROUNDS = 10;

/** Coordinates phone OTP login and profile setup. */
@Injectable()
export class AuthService {
  public constructor(
    @InjectModel(OtpCode.name) private readonly otpCodeModel: Model<OtpCodeDocument>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  /** Creates a mock OTP challenge and records a dev SMS message. */
  public async requestOtp(phone: string): Promise<{ readonly message: string }> {
    const expiresAt = this.createOtpExpiryDate();
    const hashedCode = await bcrypt.hash(MOCK_OTP_CODE, BCRYPT_SALT_ROUNDS);
    await this.otpCodeModel.create({ expiresAt, hashedCode, phone });
    await this.notificationsService.sendSms({
      message: `WishCircle OTP của bạn là ${MOCK_OTP_CODE}. Mã hết hạn sau ${OTP_TTL_MINUTES} phút.`,
      recipientPhone: phone,
      type: NotificationType.Otp,
    });
    return { message: 'OTP sent.' };
  }

  /** Verifies an OTP and returns a JWT session. */
  public async verifyOtp(phone: string, code: string): Promise<AuthResponse> {
    const otpCode = await this.otpCodeModel.findOne({ consumedAt: { $exists: false }, phone }).sort({ createdAt: -1 }).exec();
    if (!otpCode || otpCode.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('OTP is invalid or expired.');
    }
    const isCodeValid = await bcrypt.compare(code, otpCode.hashedCode);
    if (!isCodeValid) {
      throw new UnauthorizedException('OTP is invalid or expired.');
    }
    otpCode.consumedAt = new Date();
    await otpCode.save();
    const user = await this.usersService.getOrCreateByPhone(phone);
    return this.createAuthResponse(user);
  }

  /** Completes user profile after authentication. */
  public async setupProfile(userId: string, name: string, birthday: string): Promise<AuthResponse> {
    const birthdayDate = new Date(birthday);
    if (Number.isNaN(birthdayDate.getTime())) {
      throw new BadRequestException('Birthday is invalid.');
    }
    const user = await this.usersService.updateProfile(userId, name, birthdayDate);
    return this.createAuthResponse(user);
  }

  private createOtpExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_TTL_MINUTES);
    return expiresAt;
  }

  private createAuthResponse(user: UserDocument): AuthResponse {
    const accessToken = this.jwtService.sign({ phone: user.phone, sub: user._id.toString() });
    return { accessToken, user };
  }
}

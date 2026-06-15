import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedUser } from './authenticated-user.type';
import { AuthResponse } from './auth-response.type';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RequestOtpDto } from './request-otp.dto';
import { SetupProfileDto } from './setup-profile.dto';
import { VerifyOtpDto } from './verify-otp.dto';

/** Phone-only authentication endpoints. */
@Controller('auth')
export class AuthController {
  public constructor(private readonly authService: AuthService) {}

  /** Requests a mock OTP SMS for the phone number. */
  @Post('request-otp')
  public async requestOtp(@Body() dto: RequestOtpDto): Promise<{ readonly message: string }> {
    return this.authService.requestOtp(dto.phone);
  }

  /** Verifies OTP and returns the authenticated session. */
  @Post('verify-otp')
  public async verifyOtp(@Body() dto: VerifyOtpDto): Promise<AuthResponse> {
    return this.authService.verifyOtp(dto.phone, dto.code);
  }

  /** Completes the profile for the signed-in user. */
  @Post('profile')
  @UseGuards(JwtAuthGuard)
  public async setupProfile(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: SetupProfileDto,
  ): Promise<AuthResponse> {
    return this.authService.setupProfile(currentUser.id, dto.name, dto.birthday);
  }
}

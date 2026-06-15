import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { OtpCode, OtpCodeSchema } from './otp-code.schema';

/** Authentication module for phone OTP and JWT sessions. */
@Module({
  controllers: [AuthController],
  imports: [
    UsersModule,
    NotificationsModule,
    PassportModule,
    MongooseModule.forFeature([{ name: OtpCode.name, schema: OtpCodeSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'dev-wishcircle-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '30d') as JwtSignOptions['expiresIn'],
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}

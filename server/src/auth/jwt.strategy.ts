import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthenticatedUser } from './authenticated-user.type';

type JwtPayload = {
  readonly phone: string;
  readonly sub: string;
};

/** Validates access tokens and exposes the authenticated user payload. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  public constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dev-wishcircle-secret'),
    });
  }

  /** Converts a verified JWT payload into request user context. */
  public validate(payload: JwtPayload): AuthenticatedUser {
    return { id: payload.sub, phone: payload.phone };
  }
}

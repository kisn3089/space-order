import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { COOKIE_TABLE } from '@spaceorder/db/constants';
import { TokenPayload } from '@spaceorder/db';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.[COOKIE_TABLE.REFRESH],
      ]),
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const refreshToken: string | null | undefined =
      request.cookies?.[COOKIE_TABLE.REFRESH];

    if (!refreshToken) return null;
    return await this.authService.validateRefreshToken(
      refreshToken,
      payload.sub,
    );
  }
}

import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from './token-payload.interface';
import { responseCookie } from '../cookies';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { Admin, Owner, COOKIE_TABLE } from '@spaceorder/db';

@Injectable()
export class GenerateToken {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  tokenConfig(expirationConfigName: string) {
    const expiresTimes = parseInt(
      this.configService.getOrThrow<string>(expirationConfigName),
    );
    return {
      jwt: (baseTokenPayload: TokenPayload, jwtConfigName: string) => {
        const accessToken = this.jwtService.sign(baseTokenPayload, {
          secret: this.configService.getOrThrow<string>(jwtConfigName),
          expiresIn: `${expiresTimes}ms`,
        });
        return accessToken;
      },
      expiresAt: () => new Date(Date.now() + expiresTimes),
    };
  }

  generateToken(user: Owner | Admin, response: Response) {
    const tokenPayload: TokenPayload = {
      sub: user.publicId.toString(),
      email: user.email,
      username: user.name,
      role: 'role' in user ? 'admin' : 'owner',
      iss: this.configService.get('JWT_ISSUER'),
      aud: this.configService.get('JWT_AUDIENCE'),
      typ: `Bearer`,
    };
    const expiresAt = this.tokenConfig(
      'JWT_ACCESS_TOKEN_EXPIRATION_MS',
    ).expiresAt();

    const accessToken = this.tokenConfig('JWT_ACCESS_TOKEN_EXPIRATION_MS').jwt(
      tokenPayload,
      'JWT_ACCESS_TOKEN_SECRET',
    );

    const expiresRefreshToken = this.tokenConfig(
      'JWT_REFRESH_TOKEN_EXPIRATION_MS',
    ).expiresAt();

    const refreshToken = this.tokenConfig(
      'JWT_REFRESH_TOKEN_EXPIRATION_MS',
    ).jwt(tokenPayload, 'JWT_REFRESH_TOKEN_SECRET');

    responseCookie.set(response, COOKIE_TABLE.REFRESH, refreshToken, {
      expires: expiresRefreshToken,
    });

    return { accessToken, expiresAt, refreshToken, tokenPayload };
  }
}

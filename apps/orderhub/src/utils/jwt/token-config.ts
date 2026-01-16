import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from '@spaceorder/db/types/token-payload.interface';
import { responseCookie } from '../cookies';
import { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { Admin, Owner } from '@spaceorder/db';
import { COOKIE_TABLE } from '@spaceorder/db/constants';

@Injectable()
export class GenerateTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // private createTokenHelper(expirationConfigName: string) {
  private createTokenHelper(expirationConfigName: number) {
    // const expiresTimes = parseInt(
    //   this.configService.getOrThrow<string>(expirationConfigName),
    // );
    return {
      jwt: (baseTokenPayload: TokenPayload, jwtConfigName: string) => {
        const accessToken = this.jwtService.sign(baseTokenPayload, {
          secret: this.configService.getOrThrow<string>(jwtConfigName),
          expiresIn: `${expirationConfigName}ms`,
        });
        return accessToken;
      },
      expiresAt: () => new Date(Date.now() + expirationConfigName),
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

    const expiresAt = this.createTokenHelper(
      // 'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      3000,
    ).expiresAt();

    const accessToken = this.createTokenHelper(
      // 'JWT_ACCESS_TOKEN_EXPIRATION_MS',
      3000,
    ).jwt(tokenPayload, 'JWT_ACCESS_TOKEN_SECRET');

    const expiresRefreshToken = this.createTokenHelper(
      // 'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      3600000,
    ).expiresAt();

    const refreshToken = this.createTokenHelper(
      // 'JWT_REFRESH_TOKEN_EXPIRATION_MS',
      3600000,
    ).jwt(tokenPayload, 'JWT_REFRESH_TOKEN_SECRET');

    responseCookie.set(response, COOKIE_TABLE.REFRESH, refreshToken, {
      expires: expiresRefreshToken,
    });

    responseCookie.set(response, COOKIE_TABLE.ACCESS_TOKEN, accessToken, {
      expires: expiresAt,
    });

    return { accessToken, expiresAt, refreshToken, tokenPayload };
  }
}

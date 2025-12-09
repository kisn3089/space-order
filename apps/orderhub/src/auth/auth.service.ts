import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from '../../utils/jwt/token-payload.interface';
import { Owner } from '@spaceorder/db';
import { comparePassword, encryptPassword } from 'utils/lib/crypt';
import { responseCookie } from 'utils/cookies';
import { OwnerService } from 'src/owner/owner.service';
import { SignInRequest, SignInResponse } from '@spaceorder/api';
@Injectable()
export class AuthService {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  private makeToken(expirationConfigName: string) {
    const expiresTimes = parseInt(
      this.configService.getOrThrow<string>(expirationConfigName),
    );
    return {
      jwt: (tokenPayload: TokenPayload, jwtConfigName: string) => {
        const accessToken = this.jwtService.sign(tokenPayload, {
          secret: this.configService.getOrThrow<string>(jwtConfigName),
          expiresIn: `${expiresTimes}ms`,
        });
        return accessToken;
      },
      expriresTime: () => {
        const expiresAccessTime = new Date();
        expiresAccessTime.setMilliseconds(
          expiresAccessTime.getTime() + expiresTimes,
        );
        return expiresAccessTime;
      },
    };
  }

  async signIn(owner: Owner, response: Response): Promise<SignInResponse> {
    const expiresAccessTime = this.makeToken(
      'JWT_ACCESS_TOKEN_EXPIRATION_MS',
    ).expriresTime();

    const tokenPayload: TokenPayload = { userId: owner.publicId.toString() };
    const accessToken = this.makeToken('JWT_ACCESS_TOKEN_EXPIRATION_MS').jwt(
      tokenPayload,
      'JWT_ACCESS_TOKEN_SECRET',
    );

    const expiresRefreshToken = this.makeToken(
      'JWT_REFRESH_TOKEN_EXPIRATION_MS',
    ).expriresTime();

    const refreshToken = this.makeToken('JWT_REFRESH_TOKEN_EXPIRATION_MS').jwt(
      tokenPayload,
      'JWT_REFRESH_TOKEN_SECRET',
    );

    await this.ownerService.updateRefreshToken(
      owner.publicId,
      await encryptPassword(refreshToken),
    );

    await this.ownerService.updateLastSignIn(owner.publicId);

    responseCookie.set(response, 'Authentication', accessToken, {
      expires: expiresAccessTime,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });

    responseCookie.set(response, 'Refresh', refreshToken, {
      expires: expiresRefreshToken,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });

    return {
      accessToken,
      expiresAt: expiresAccessTime,
    };
  }

  async verifyUser({ email, password }: SignInRequest): Promise<Owner> {
    try {
      console.log('Verifying user with email:', email, password);

      const owner = await this.ownerService.findByEmail(email);
      const authenticated = await comparePassword(password, owner.password);
      if (!authenticated) throw new Error();

      return owner;
    } catch {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
  }

  async veryfyUserRefreshToekn(
    refreshToken: string,
    publicId: string,
  ): Promise<Owner> {
    try {
      const owner = await this.ownerService.findOne(publicId);
      if (owner.refreshToken === null) throw new UnauthorizedException();

      const authenticated = await comparePassword(
        refreshToken,
        owner.refreshToken,
      );

      if (!authenticated) throw new UnauthorizedException();
      return owner;
    } catch {
      throw new UnauthorizedException('Refresh token is not valid');
    }
  }
}

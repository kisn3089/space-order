import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from '../../utils/jwt/token-payload.interface';
import { Admin } from '@spaceorder/db/client';
import { comparePassword, encryptPassword } from 'utils/lib/crypt';
import { responseCookie } from 'utils/cookies';
@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
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

  async signIn(admin: Admin, response: Response) {
    const expiresAccessTime = this.makeToken(
      'JWT_ACCESS_TOKEN_EXPIRATION_MS',
    ).expriresTime();

    const tokenPayload: TokenPayload = { userId: admin.publicId.toString() };
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

    await this.adminService.updateRefreshToken(
      admin.publicId,
      await encryptPassword(refreshToken),
    );

    await this.adminService.updateLastSignIn(admin.publicId);

    responseCookie.set(response, 'Authentication', accessToken, {
      expires: expiresAccessTime,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });

    responseCookie.set(response, 'Authentication', accessToken, {
      expires: expiresRefreshToken,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });

    return {
      accessToken,
      expiresAt: expiresAccessTime,
    };
  }

  async verifyUser(email: string, password: string) {
    try {
      const admin = await this.adminService.findByEmail(email);
      const authenticated = await comparePassword(password, admin.password);
      if (!authenticated) throw new Error();

      return admin;
    } catch {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
  }

  async veryfyUserRefreshToekn(refreshToken: string, publicId: string) {
    try {
      const user = await this.adminService.findOne(publicId);
      if (user.refreshToken === null) throw new UnauthorizedException();

      const authenticated = await comparePassword(
        refreshToken,
        user.refreshToken,
      );

      if (!authenticated) throw new UnauthorizedException();
      return user;
    } catch {
      throw new UnauthorizedException('Refresh token is not valid');
    }
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { TokenPayload } from './token-payload.interface';
import { Admin } from '@spaceorder/db/client';
import { comparePassword } from 'utils/lib/crypt';
@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  signIn(admin: Admin, response: Response) {
    console.log('admin: ', admin);

    const expiresAccessTime = new Date();
    expiresAccessTime.setMilliseconds(
      expiresAccessTime.getTime() +
        parseInt(
          this.configService.getOrThrow<string>(
            'JWT_ACCESS_TOKEN_EXPIRATION_MS',
          ),
        ),
    );

    const tokenPayload: TokenPayload = { userId: admin.publicId.toString() };
    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: `${parseInt(
        this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_EXPIRATION_MS'),
      )}ms`,
    });

    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      expires: expiresAccessTime,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
    });
    return {
      accessToken: accessToken,
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
}

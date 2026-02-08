import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma, TokenPayload, User } from '@spaceorder/db';
import { comparePlainToEncrypted, encrypt } from 'src/utils/lib/crypt';
import type { AccessToken, SignInPayload } from '@spaceorder/api';
import { TokenService } from './token.service';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { OwnerService } from 'src/identity/owner/owner.service';
import { AdminService } from 'src/identity/admin/admin.service';

type FindUserByRoleParams =
  | { role: 'owner'; where: Prisma.OwnerWhereInput }
  | { role: 'admin'; where: Prisma.AdminWhereInput };

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly ownerService: OwnerService,
    private readonly adminService: AdminService,
  ) {}

  async createToken(
    user: User,
    response: Response,
    role: TokenPayload['role'],
  ): Promise<AccessToken> {
    const { accessToken, expiresAt, refreshToken } =
      this.tokenService.generateToken(user, response, role);

    const encryptedRefreshToken = await encrypt(refreshToken);

    await this.updateRefreshTokenByRole(
      role,
      user.publicId,
      encryptedRefreshToken,
    );

    return { accessToken, expiresAt };
  }

  async validateRefreshToken(
    refreshToken: string,
    { role, sub }: TokenPayload,
  ): Promise<User> {
    const user = await this.findUserByRole({ role, where: { publicId: sub } });

    if (!user || user.refreshToken === null) {
      throw new HttpException(
        exceptionContentsIs('REFRESH_FAILED'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const authenticated = await comparePlainToEncrypted(
      refreshToken,
      user.refreshToken,
    );

    if (!authenticated) {
      throw new HttpException(
        exceptionContentsIs('REFRESH_FAILED'),
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }

  async findUserByRole({ role, where }: FindUserByRoleParams): Promise<User> {
    switch (role) {
      case 'owner':
        return await this.ownerService.getUnique({ where });
      case 'admin':
        return await this.adminService.getUnique({ where });
      default:
        throw new HttpException(
          exceptionContentsIs('INVALID_ROLE'),
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  private async updateRefreshTokenByRole(
    role: TokenPayload['role'],
    ...args: Parameters<OwnerService['updateRefreshToken']>
  ) {
    switch (role) {
      case 'owner':
        return await this.ownerService.updateRefreshToken(...args);
      case 'admin':
        return await this.adminService.updateRefreshToken(...args);
      default:
        throw new HttpException(
          exceptionContentsIs('INVALID_ROLE'),
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  async validateSignInPayload(
    { email, password }: SignInPayload,
    role: TokenPayload['role'],
  ): Promise<User | undefined> {
    try {
      const user = await this.findUserByRole({ role, where: { email } });

      const isCorrectPassword = await comparePlainToEncrypted(
        password,
        user.password,
      );

      if (!isCorrectPassword) {
        throw new UnauthorizedException('INVALID PASSWORD');
      }

      return user;
    } catch {
      throw new HttpException(
        exceptionContentsIs('SIGNIN_FAILED'),
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}

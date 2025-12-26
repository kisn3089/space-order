import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { Owner, COOKIE_TABLE } from '@spaceorder/db';
import { comparePassword, encryptPassword } from 'src/utils/lib/crypt';
import { OwnerService } from '../owner/owner.service';
import type { AccessToken, SignInRequest } from '@spaceorder/api';
import { GenerateToken } from 'src/utils/jwt/token-config';

@Injectable()
export class TokenService {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly generateToken: GenerateToken,
  ) {}

  async create(owner: Owner, response: Response): Promise<AccessToken> {
    const { accessToken, expiresAt, refreshToken } =
      this.generateToken.generateToken(owner, response);

    await this.ownerService.update(owner.publicId, {
      lastLoginAt: new Date(),
      refreshToken: await encryptPassword(refreshToken),
    });

    return { accessToken, expiresAt };
  }

  async verifyOwner({ email, password }: SignInRequest): Promise<Owner> {
    try {
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

  async verifyOwnerRefreshToken(
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
      throw new UnauthorizedException(
        `${COOKIE_TABLE.REFRESH} token is not valid`,
      );
    }
  }
}

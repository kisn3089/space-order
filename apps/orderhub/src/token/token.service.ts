import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { Owner, COOKIE_TABLE } from '@spaceorder/db';
import { comparePassword, encrypt } from 'src/utils/lib/crypt';
import { OwnerService } from '../owner/owner.service';
import type { AccessToken, SignInRequest } from '@spaceorder/api';
import { GenerateToken } from 'src/utils/jwt/token-config';

/** TODO: admin, owner 분기될 시점에는 인자를 추가로 받아서 처리해야 한다.
 * ex) user: Owner | Admin
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly generateToken: GenerateToken,
  ) {}

  async createToken(owner: Owner, response: Response): Promise<AccessToken> {
    const { accessToken, expiresAt, refreshToken } =
      this.generateToken.generateToken(owner, response);

    await this.ownerService.updateRefreshToken(
      owner.publicId,
      await encrypt(refreshToken),
    );

    return { accessToken, expiresAt };
  }

  async validateSignInSchema({
    email,
    password,
  }: SignInRequest): Promise<Owner> {
    try {
      const owner = await this.ownerService.retrieveOwnerByEmail(email);
      const authenticated = await comparePassword(password, owner.password);
      if (!authenticated) throw new Error();
      return owner;
    } catch {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }
  }

  async validateRefreshToken(
    refreshToken: string,
    ownerPublicId: string,
  ): Promise<Owner> {
    try {
      const owner = await this.ownerService.retrieveOwnerById(ownerPublicId);
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { Owner, Prisma } from '@spaceorder/db';
import { comparePlainToEncrypted, encrypt } from 'src/utils/lib/crypt';
import { OwnerService } from '../owner/owner.service';
import type { ResponseAccessToken, SignInRequest } from '@spaceorder/api';
import { GenerateTokenService } from 'src/utils/jwt/token-config';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { OwnerResponseDto } from 'src/owner/dto/ownerResponse.dto';

/** TODO: admin, owner 분기될 시점에는 인자를 추가로 받아서 처리해야 한다.
 * ex) user: Owner | Admin
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly generateToken: GenerateTokenService,
  ) {}

  async createToken(
    owner: Owner,
    response: Response,
  ): Promise<ResponseAccessToken> {
    const { accessToken, expiresAt, refreshToken } =
      this.generateToken.generateToken(owner, response);

    await this.ownerService.updateRefreshToken(
      owner.publicId,
      await encrypt(refreshToken),
    );

    return { accessToken, expiresAt };
  }

  async validateSignInPayload({
    email,
    password,
  }: SignInRequest): Promise<OwnerResponseDto | undefined> {
    try {
      const owner = await this.ownerService.getOwnerByEmail(email);

      const isCorrectPassword = await comparePlainToEncrypted(
        password,
        owner.password,
      );

      if (!isCorrectPassword) {
        throw new Error('INVALID PASSWORD');
      }
      return new OwnerResponseDto(owner);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        (error instanceof Error && error.message === 'INVALID PASSWORD')
      ) {
        throw new HttpException(
          exceptionContentsIs('SIGNIN_FAILED'),
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  async validateRefreshToken(
    refreshToken: string,
    ownerPublicId: string,
  ): Promise<Owner> {
    const owner = await this.ownerService.getOwnerById(ownerPublicId);
    if (!owner || owner.refreshToken === null) {
      throw new HttpException(
        exceptionContentsIs('REFRESH_FAILED'),
        HttpStatus.UNAUTHORIZED,
      );
    }

    const authenticated = await comparePlainToEncrypted(
      refreshToken,
      owner.refreshToken,
    );

    if (!authenticated) {
      throw new HttpException(
        exceptionContentsIs('REFRESH_FAILED'),
        HttpStatus.UNAUTHORIZED,
      );
    }
    return owner;
  }
}

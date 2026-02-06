import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { Owner, Prisma, PublicOwner } from '@spaceorder/db';
import { comparePlainToEncrypted, encrypt } from 'src/utils/lib/crypt';
import type { AccessToken, SignInPayload } from '@spaceorder/api';
import { GenerateTokenService } from 'src/utils/jwt/token-config';
import { exceptionContentsIs } from 'src/common/constants/exceptionContents';
import { PrismaService } from '../../prisma/prisma.service';
import { PublicOwnerDto } from '../../dto/public/owner.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly generateToken: GenerateTokenService,
  ) {}
  omitPrivate = { id: true, password: true, refreshToken: true } as const;

  async createToken(owner: Owner, response: Response): Promise<AccessToken> {
    const { accessToken, expiresAt, refreshToken } =
      this.generateToken.generateToken(owner, response);

    await this.updateRefreshToken(owner.publicId, await encrypt(refreshToken));

    return { accessToken, expiresAt };
  }

  private async updateRefreshToken(
    ownerPublicId: string,
    refreshToken: string,
  ): Promise<PublicOwner> {
    return await this.prismaService.owner.update({
      where: { publicId: ownerPublicId },
      data: { lastLoginAt: new Date(), refreshToken },
      omit: this.omitPrivate,
    });
  }

  async validateSignInPayload({
    email,
    password,
  }: SignInPayload): Promise<PublicOwnerDto | undefined> {
    try {
      const owner = await this.getOwnerUnique({
        where: { email },
      });

      const isCorrectPassword = await comparePlainToEncrypted(
        password,
        owner.password,
      );

      if (!isCorrectPassword) {
        throw new UnauthorizedException('INVALID PASSWORD');
      }
      return new PublicOwnerDto(owner);
    } catch (error: unknown) {
      if (
        error instanceof UnauthorizedException &&
        error.message === 'INVALID PASSWORD'
      ) {
        throw new HttpException(
          exceptionContentsIs('SIGNIN_FAILED'),
          HttpStatus.UNAUTHORIZED,
        );
      }
    }
  }

  async getOwnerUnique<T extends Prisma.OwnerFindFirstOrThrowArgs>(
    args: Prisma.SelectSubset<T, Prisma.OwnerFindFirstOrThrowArgs>,
  ): Promise<Prisma.OwnerGetPayload<T>> {
    return await this.prismaService.owner.findFirstOrThrow(args);
  }

  async validateRefreshToken(
    refreshToken: string,
    ownerId: string,
  ): Promise<Owner> {
    const owner = await this.getOwnerUnique({
      where: { publicId: ownerId },
    });

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

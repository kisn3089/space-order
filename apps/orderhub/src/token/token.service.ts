import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { Owner, PlainOwner } from '@spaceorder/db';
import { comparePassword, encryptPassword } from 'src/utils/lib/crypt';
import { OwnerService } from '../owner/owner.service';
import { AccessToken, SignInRequest, SignInResponse } from '@spaceorder/api';
import { OwnerResponseDto } from 'src/owner/dto/response.dto';
import { instanceToPlain } from 'class-transformer';
import { GenerateToken } from 'src/utils/jwt/token-config';
import { TokenPayload } from 'src/utils/jwt/token-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly generateToken: GenerateToken,
  ) {}

  private async getUserInfo(
    owner: Owner,
    tokenPayload: TokenPayload,
  ): Promise<PlainOwner> {
    // 추후 tokenPayload에 담긴 role로 admin/owner 구분
    const ownerUser = await this.ownerService.findByEmail(owner.email);
    const ownerDto = new OwnerResponseDto(ownerUser);
    const plainOwner = {
      ...instanceToPlain(ownerDto, {
        excludeExtraneousValues: true,
      }),
      role: tokenPayload.role,
    } as PlainOwner;

    return plainOwner;
  }

  async create(owner: Owner, response: Response): Promise<AccessToken> {
    const { accessToken, expiresAt, refreshToken } =
      this.generateToken.generateToken(owner, response);

    await this.ownerService.update(owner.publicId, {
      lastLoginAt: new Date(),
      refreshToken: await encryptPassword(refreshToken),
    });

    return { accessToken, expiresAt };
  }

  async createWithUserInfo(
    owner: Owner,
    response: Response,
  ): Promise<SignInResponse> {
    const { accessToken, expiresAt, refreshToken, tokenPayload } =
      this.generateToken.generateToken(owner, response);

    await this.ownerService.update(owner.publicId, {
      lastLoginAt: new Date(),
      refreshToken: await encryptPassword(refreshToken),
    });

    const plainOwner = await this.getUserInfo(owner, tokenPayload);

    return {
      owner: plainOwner,
      auth: { accessToken, expiresAt },
    };
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
      throw new UnauthorizedException('Refresh token is not valid');
    }
  }
}

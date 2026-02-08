import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { authDocs } from 'src/docs/autu.docs';
import { LocalSignInGuard } from './guards/local-sign-in.guard';
import {
  type Admin,
  COOKIE_TABLE,
  type Owner,
  type User,
} from '@spaceorder/db';
import type { Response } from 'express';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { signInPayloadSchema } from '@spaceorder/api/schemas';
import { AccessTokenDto } from 'src/dto/public/access-token.dto';
import { SignInPayloadDto } from 'src/dto/auth.dto';
import { Client } from 'src/decorators/client.decorator';

@ApiTags('Auth')
@Controller('auth/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('owner/signin')
  @UseGuards(ZodValidation({ body: signInPayloadSchema }), LocalSignInGuard)
  @ApiOperation({ summary: authDocs.signIn.summary })
  @ApiBody({ type: SignInPayloadDto })
  @ApiResponse({
    ...authDocs.signIn.successResponse,
    type: AccessTokenDto,
  })
  @ApiResponse(authDocs.unauthorizedResponse)
  async ownerSignIn(
    @Client() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    return new AccessTokenDto(
      await this.authService.createToken(owner, response),
    );
  }

  @Post('admin/signin')
  @UseGuards(ZodValidation({ body: signInPayloadSchema }), LocalSignInGuard)
  @ApiOperation({ summary: authDocs.signIn.summary })
  @ApiBody({ type: SignInPayloadDto })
  @ApiResponse({
    ...authDocs.signIn.successResponse,
    type: AccessTokenDto,
  })
  @ApiResponse(authDocs.unauthorizedResponse)
  async adminSignIn(
    @Client() admin: Admin,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    return new AccessTokenDto(
      await this.authService.createToken(admin, response),
    );
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @ApiCookieAuth(COOKIE_TABLE.REFRESH)
  @ApiOperation({ summary: authDocs.refresh.summary })
  @ApiResponse({
    ...authDocs.refresh.successResponse,
    type: AccessTokenDto,
  })
  @ApiResponse(authDocs.unauthorizedResponse)
  async createTokenByRefreshToken(
    @Client() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    return new AccessTokenDto(
      await this.authService.createToken(user, response),
    );
  }
}

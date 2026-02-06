import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { authDocs } from 'src/docs/autu.docs';
import { LocalSignInGuard } from '../../utils/guards/local-sign-in.guard';
import { Client } from '../../decorators/client.decorator';
import { COOKIE_TABLE, type Owner } from '@spaceorder/db';
import type { Response } from 'express';
import { JwtRefreshAuthGuard } from 'src/utils/guards/jwt-refresh-auth.guard';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { signInPayloadSchema } from '@spaceorder/api/schemas';
import { AccessTokenDto } from 'src/dto/public/access-token.dto';
import { SignInPayloadDto } from 'src/dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @UseGuards(ZodValidation({ body: signInPayloadSchema }), LocalSignInGuard)
  @ApiOperation({ summary: authDocs.signIn.summary })
  @ApiBody({ type: SignInPayloadDto })
  @ApiResponse({
    ...authDocs.signIn.successResponse,
    type: AccessTokenDto,
  })
  @ApiResponse(authDocs.unauthorizedResponse)
  async signIn(
    @Client() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    return new AccessTokenDto(
      await this.authService.createToken(owner, response),
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
    @Client() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenDto> {
    return new AccessTokenDto(
      await this.authService.createToken(owner, response),
    );
  }
}

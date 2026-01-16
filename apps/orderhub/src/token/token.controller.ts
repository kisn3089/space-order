import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { LocalSignInGuard } from '../utils/guards/local-sign-in.guard';
import { Client } from '../decorators/client.decorator';
import type { Owner } from '@spaceorder/db';
import type { Response } from 'express';
import { JwtRefreshAuthGuard } from 'src/utils/guards/jwt-refresh-auth.guard';
import { ZodValidation } from 'src/utils/guards/zod-validation.guard';
import { AccessToken } from '@spaceorder/api';
import { signInFormSchema } from '@spaceorder/api/schemas';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  @UseGuards(ZodValidation({ body: signInFormSchema }), LocalSignInGuard)
  createTokenBySignIn(
    @Client() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessToken> {
    return this.tokenService.createToken(owner, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  createTokenByRefreshToken(
    @Client() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessToken> {
    return this.tokenService.createToken(owner, response);
  }
}

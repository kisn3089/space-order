import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { LocalAuthGuard } from '../utils/guards/local-auth.guard';
import { Client } from '../dacorators/client.decorator';
import type { Owner } from '@spaceorder/db';
import type { Response } from 'express';
import { JwtRefreshAuthGuard } from 'src/utils/guards/jwt-refresh-auth.guard';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { signInFormSchema } from '@spaceorder/auth';
import { AccessToken } from '@spaceorder/api';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  @UseGuards(ZodValidationGuard({ body: signInFormSchema }), LocalAuthGuard)
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

import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { LocalAuthGuard } from '../utils/guards/local-auth.guard';
import { JwtUser } from '../dacorators/jwtUser.decorator';
import type { Owner } from '@spaceorder/db';
import type { Response } from 'express';
import { JwtRefreshAuthGuard } from 'src/utils/guards/jwt-refresh-auth.guard';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { signInFormSchema } from '@spaceorder/auth';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  @UseGuards(ZodValidationGuard({ body: signInFormSchema }), LocalAuthGuard)
  createTokenBySignIn(
    @JwtUser() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.tokenService.createToken(owner, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  createTokenByRefreshToken(
    @JwtUser() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.tokenService.createToken(owner, response);
  }
}

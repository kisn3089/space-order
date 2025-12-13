import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { LocalAuthGuard } from '../utils/guards/local-auth.guard';
import { CurrentUser } from '../dacorators/current-user.decorator';
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
  signIn(
    @CurrentUser() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.tokenService.createWithUserInfo(owner, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  refreshToken(
    @CurrentUser() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.tokenService.create(owner, response);
  }
}

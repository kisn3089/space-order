import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../utils/guards/local-auth.guard';
import { CurrentUser } from '../dacorators/current-user.decorator';
import type { Owner } from '@spaceorder/db';
import type { Response } from 'express';
import { JwtRefreshAuthGuard } from 'src/utils/guards/jwt-refresh-auth.guard';
import { ZodValidationGuard } from 'src/utils/guards/zod-validation.guard';
import { signInFormSchema } from '@spaceorder/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @UseGuards(ZodValidationGuard({ body: signInFormSchema }), LocalAuthGuard)
  signIn(
    @CurrentUser() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(owner, response);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  refreshToken(
    @CurrentUser() owner: Owner,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(owner, response);
  }

  // @Post('admin/signin')
  // @UseGuards(LocalAuthGuard)
  // signIn(
  //   @CurrentAdmin() admin: Admin,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   return this.authService.signIn(admin, response);
  // }

  // @Post('admin/refresh')
  // @UseGuards(JwtRefreshAuthGuard)
  // refreshToken(
  //   @CurrentAdmin() admin: Admin,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   return this.authService.signIn(admin, response);
  // }
}

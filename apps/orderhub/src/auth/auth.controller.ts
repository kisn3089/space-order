import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../utils/guards/local-auth.guard';
import { CurrentUser } from '../../utils/dacorator/current-user.decorator';
import type { Owner } from '@spaceorder/db/client';
import type { Response } from 'express';
import { JwtRefreshAuthGuard } from 'utils/guards/jwt-refresh-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
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

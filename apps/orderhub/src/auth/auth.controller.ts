import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../utils/guards/local-auth.guard';
import { CurrentUser } from '../../utils/dacorator/current-user.decorator';
import type { Owner } from '@spaceorder/db';
import type { Response } from 'express';
import { JwtRefreshAuthGuard } from 'utils/guards/jwt-refresh-auth.guard';
// import { SignInDto } from './dto/signin.dto';
import { createZodDto, ZodResponse } from 'nestjs-zod';
import z from 'zod';
import { SignInFormSchema, signInFormSchema } from '@spaceorder/auth';

class PostDto extends createZodDto(signInFormSchema) {}
// type A = SignInFormSchema;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  // @ZodResponse({ type: SignInDto })
  @UseGuards(LocalAuthGuard)
  signIn(
    // @Body() signInDto: SignInDto,
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

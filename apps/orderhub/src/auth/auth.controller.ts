import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../utils/guards/local-auth.guard';
import { CurrentAdmin } from '../../utils/dacorator/current-admin.decorator';
import type { Admin } from '@spaceorder/db/client';
import type { Response } from 'express';
import { SignInDto } from './dto/signIn.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Passport LocalStrategy 사용 방식 + DTO 검증
   */
  @Post('admin/signin')
  @UseGuards(LocalAuthGuard)
  signIn(
    @CurrentAdmin() admin: Admin,
    @Body() signInDto: SignInDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(admin, response);
  }

  /**
   * DTO 검증 + 직접 구현 방식 (추천)
   */
  // @Post('admin/signin-v2')
  // async loginWithDto(
  //   @Body() signinDto: SigninDto,
  //   @Res({ passthrough: true }) response: Response,
  // ) {
  //   const admin = await this.authService.verifyUser(
  //     signinDto.email,
  //     signinDto.password,
  //   );
  //   return this.authService.signin(admin, response);
  // }
}

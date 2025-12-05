import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
// import { SigninDto } from './dto/signin.dto';
import type { Admin } from '@spaceorder/db/client';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Passport LocalStrategy 사용 방식 + DTO 검증
   */
  @Post('admin/signin')
  @UseGuards(LocalAuthGuard)
  signIn(
    // @Body() signinDto: SigninDto,
    @CurrentAdmin() admin: Admin,
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

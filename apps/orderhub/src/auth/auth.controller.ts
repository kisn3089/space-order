import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentAdmin } from './current-admin.decorator';
import { LoginDto } from './dto/signin.dto';
import type { Admin } from '@spaceorder/db/client';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Passport LocalStrategy 사용 방식
   */
  @Post('admin/login')
  @UseGuards(LocalAuthGuard)
  loginWithGuard(
    @CurrentAdmin() admin: Admin,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(admin, response);
  }

  /**
   * DTO 검증 + 직접 구현 방식 (추천)
   */
  @Post('admin/login-v2')
  async loginWithDto(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const admin = await this.authService.verifyUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(admin, response);
  }
}

import { Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from '../../utils/guards/local-auth.guard';
import { CurrentAdmin } from '../../utils/dacorator/current-admin.decorator';
import type { Admin } from '@spaceorder/db/client';
import type { Response } from 'express';
// import { SignInDto } from './dto/signIn.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Passport LocalStrategy 사용 방식
   */
  @Post('admin/signin')
  @UseGuards(LocalAuthGuard)
  signIn(
    // @Body() signInDto: SignInDto,
    @CurrentAdmin() admin: Admin,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.signIn(admin, response);
  }
}

import type { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from '@spaceorder/db';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * email과 password를 검증하는 메서드 [default: username, password]
   * passReqToCallback: true로 설정하면 validate 메서드에 request 객체가 전달됨
   */
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  /**
   * validate는 예약어이며 개별 파라미터로 받기 때문에 구조 분해 X, 변수명 변경 X
   */
  async validate(
    req: Request,
    email: string,
    password: string,
  ): Promise<{ info: User | undefined }> {
    const path = req.path; // '/auth/v1/owner/signin' or '/auth/v1/admin/signin'

    if (path.includes('/owner/')) {
      const user = await this.authService.validateSignInPayload(
        { email, password },
        'owner',
      );
      return { info: user };
    }
    if (path.includes('/admin/')) {
      const user = await this.authService.validateSignInPayload(
        { email, password },
        'admin',
      );
      return { info: user };
    }
    throw new UnauthorizedException();
  }
}

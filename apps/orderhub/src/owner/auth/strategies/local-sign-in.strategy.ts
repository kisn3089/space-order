import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { PublicOwner } from '@spaceorder/db';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * email과 password를 검증하는 메서드 [default: username, password]
   * passReqToCallback: true로 설정하면 validate 메서드에 request 객체가 전달됨
   */
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  /**
   * validate는 예약어이며 개별 파라미터로 받기 때문에 구조 분해 X, 변수명 변경 X
   */
  async validate(
    email: string,
    password: string,
  ): Promise<PublicOwner | undefined> {
    return await this.authService.validateSignInPayload({ email, password });
  }
}

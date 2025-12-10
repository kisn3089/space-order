import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Owner } from '@spaceorder/db';

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
   * 이후 validate 메서드가 호출되고 성공 시 반환된 값을 request.user에 저장한다.
   * 실패한다면 401 unauthorized 에러를 반환한다.
   * passport-local의 validate는 개별 파라미터로 받음 (객체 구조 분해 X)
   */
  async validate(email: string, password: string): Promise<Owner> {
    return await this.authService.verifyUser({ email, password });
  }
}

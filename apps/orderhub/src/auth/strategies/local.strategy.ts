import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  /**
   * email과 password를 검증하는 메서드 [default: username, password]
   */
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' });
  }

  /**
   * 이후 validate 메서드가 호출되고 성공 시 반환된 값을 request.user에 저장한다.
   * 실패한다면 401 unauthorized 에러를 반환한다.
   * 실패 응답을 커스텀 가능할까?
   */
  async validate(email: string, password: string) {
    return this.authService.verifyUser(email, password);
  }
}

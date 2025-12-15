import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PlainOwner } from '@spaceorder/db';
import { responseMessage } from 'src/common/constants/response-message';

/**
 * JWT 에러 정보 타입
 */
export interface JwtErrorInfo {
  name?: 'TokenExpiredError' | 'Error' | 'NotBeforeError';
  message?: string;
  expiredAt?: Date;
}

/**
 * JWT 토큰 검증을 위한 Guard
 * JwtStrategy를 실행하여 쿠키의 토큰을 검증함
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * JWT 검증 결과를 처리하는 메서드
   * @param err - JWT 검증 중 발생한 에러
   * @param user - JwtStrategy.validate()의 반환값
   * @param info - Passport가 제공하는 추가 정보 (TokenExpiredError, JsonWebTokenError 등)
   * @param context - 실행 컨텍스트
   * @param status - HTTP 상태 코드 (선택사항)
   */
  handleRequest<User = PlainOwner>(
    err: any,
    user: any,
    info: JwtErrorInfo,
  ): User {
    // 1. 오류 시 로깅
    if (err || !user) {
      // [TODO:] 로깅 서비스로 변경 필요
      console.warn('user: ', user);
      console.warn('error: ', err?.message);
      console.warn('info: ', info?.name);
      console.warn('timestamp: ', new Date().toISOString());
    }

    if (info?.name === 'TokenExpiredError') {
      throw new HttpException(responseMessage('unauthorized'), 419);
    }

    // 2. 에러가 발생한 경우 (Strategy에서 던진 예외)
    if (err) throw err;

    // 3. user가 없는 경우 (토큰 검증 실패)
    if (!user) {
      // 인증 실패 시 단일된 메시지를 반환하여 보안 강화
      throw new UnauthorizedException(responseMessage('unauthorized'));
    }

    return user;
  }
}

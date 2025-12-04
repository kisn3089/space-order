import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Admin } from '@spaceorder/db/client';

/**
 * JWT 에러 정보 타입
 */
interface JwtErrorInfo {
  name?: 'TokenExpiredError' | 'Error' | 'NotBeforeError';
  message?: string;
  expiredAt?: Date;
}

/**
 * JWT 인증 후 반환되는 사용자 타입
 * id, password 필드는 제외됨
 */
type JwtUser = Omit<Admin, 'id' | 'password'>;

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
  handleRequest<User = JwtUser>(err: any, user: any, info: JwtErrorInfo): User {
    // 1. 에러가 발생한 경우 (Strategy에서 던진 예외)
    console.log('err: ', err);
    console.log('user: ', user);
    console.log('info: ', info);
    if (err) throw err;

    // 2. user가 없는 경우 (토큰 검증 실패)
    if (!user) {
      // info 객체에서 에러 타입 확인
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException(
          '토큰이 만료되었습니다. 다시 로그인해주세요.',
        );
      }
      if (info?.name === 'Error') {
        throw new UnauthorizedException('유효하지 않은 토큰입니다.');
      }
      // if (info?.name === 'NotBeforeError') {
      //   throw new UnauthorizedException('토큰이 아직 활성화되지 않았습니다.');
      // }

      // 기타 경우 (토큰 없음 등)
      throw new UnauthorizedException('인증이 필요합니다.');
    }

    return user;
  }
}

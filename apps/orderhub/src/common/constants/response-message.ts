/** deprecated 추진 */
export type ExceptionContentKeys = keyof typeof EXCEPTION_CONTENTS;

const EXCEPTION_CONTENTS = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: '요청을 처리할 권한이 없습니다.',
  },
  REFRESH_FAILED: {
    code: 'REFRESH_FAILED',
    message: 'Refresh token 값이 비어있거나 올바르지 않습니다.',
  },
  SIGNIN_FAILED: {
    code: 'SIGNIN_FAILED',
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  },
  MISSING_TABLE_SESSION: {
    code: 'MISSING_TABLE_SESSION',
    message: '테이블 세션이 존재하지 않습니다.',
  },
  EXPIRED_TABLE_SESSION: {
    code: 'EXPIRED_TABLE_SESSION',
    message: '테이블 세션 값이 만료되었습니다.',
  },
  INVALID_TABLE_SESSION: {
    code: 'INVALID_TABLE_SESSION',
    message: '테이블 세션 값이 비활성화 혹은 검증되지 않았습니다.',
  },
  /** ---ZOD--- */
  ZOD_PARAMS_FAILED: {
    code: 'ZOD_PARAMS_FAILED',
    message: '요청 인자가 올바르지 않습니다.',
  },
  ZOD_PAYLOAD_FAILED: {
    code: 'ZOD_PAYLOAD_FAILED',
    message: '요청 본문이 올바르지 않습니다.',
  },
  ZOD_QUERY_FAILED: {
    code: 'ZOD_QUERY_FAILED',
    message: '요청 쿼리가 올바르지 않습니다.',
  },
} as const;

export function exceptionContentsIs(key: ExceptionContentKeys) {
  return EXCEPTION_CONTENTS[key];
}

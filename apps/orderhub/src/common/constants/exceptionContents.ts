/** deprecated 추진 */
export type ExceptionContentKeys = keyof typeof EXCEPTION_CONTENTS;

const EXCEPTION_CONTENTS = {
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    message: '요청을 처리할 권한이 없습니다.',
  },
  BADREQUEST: {
    code: 'BADREQUEST',
    message: '요청이 올바르지 않습니다.',
  },
  FORBIDDEN: {
    code: 'FORBIDDEN',
    message: '해당 리소스에 대한 권한이 없습니다.',
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    message: '요청한 리소스를 찾을 수 없습니다.',
  },
  REFRESH_FAILED: {
    code: 'REFRESH_FAILED',
    message: 'Refresh token 값이 비어있거나 올바르지 않습니다.',
  },
  SIGNIN_FAILED: {
    code: 'SIGNIN_FAILED',
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  },
  /** ---Table Session--- */
  INVALID_TABLE_SESSION: {
    code: 'INVALID_TABLE_SESSION',
    message: '테이블 세션 값이 비어있거나 검증되지 않았습니다.',
  },
  INVALID_PAYLOAD_TABLE_SESSION: {
    code: 'INVALID_PAYLOAD_TABLE_SESSION',
    message: '업데이트 요청 본문이 올바르지 않습니다.',
  },
  TABLE_SESSION_NOT_ACTIVE: {
    code: 'TABLE_SESSION_NOT_ACTIVE',
    message: '테이블 세션이 활성화 상태가 아닙니다.',
  },
  TABLE_SESSION_ALREADY_ACTIVE: {
    code: 'TABLE_SESSION_ALREADY_ACTIVE',
    message: '이미 테이블 세션이 활성화 상태입니다.',
  },
  /** ----Order ----- */
  ORDER_IS_EMPTY: {
    code: 'ORDER_IS_EMPTY',
    message: '주문이 비어 있습니다.',
  },
  TOTAL_PRICE_MISMATCH: {
    code: 'TOTAL_PRICE_MISMATCH',
    message: '총 금액이 일치하지 않습니다.',
  },
  MENU_MISMATCH: {
    code: 'MENU_MISMATCH',
    message: '요청한 메뉴가 존재하지 않습니다.',
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

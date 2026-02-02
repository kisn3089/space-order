export const tableSessionDocs = {
  findOrCreate: {
    summary: '활성화된 세션 조회 또는 생성',
    successResponse: { status: 201, description: '세션 조회 또는 생성 성공' },
  },
  getList: {
    summary: '세션 목록 조회 (관리자)',
    successResponse: { status: 200, description: '세션 목록 반환' },
  },
  getUnique: {
    summary: '특정 세션 조회 (관리자)',
    successResponse: { status: 200, description: '세션 정보 반환' },
  },
  update: {
    summary: '세션 수정 (만료 연장 등)',
    successResponse: { status: 200, description: '세션 수정 성공' },
  },
  unauthorizedResponse: { status: 401, description: '인증되지 않은 요청' },
  sessionUnauthorizedResponse: { status: 401, description: '세션 인증 실패' },
  notFoundResponse: { status: 404, description: '세션을 찾을 수 없음' },
};

export const ownerDocs = {
  create: {
    summary: '새 매장 소유자 생성',
    successResponse: { status: 201, description: '매장 소유자 생성 성공' },
  },
  getList: {
    summary: '매장 소유자 목록 조회',
    successResponse: { status: 200, description: '매장 소유자 목록 반환' },
  },
  getUnique: {
    summary: '특정 매장 소유자 조회',
    successResponse: { status: 200, description: '매장 소유자 정보 반환' },
  },
  update: {
    summary: '매장 소유자 정보 수정',
    successResponse: { status: 200, description: '매장 소유자 정보 수정 성공' },
  },
  delete: {
    summary: '매장 소유자 삭제',
    successResponse: { status: 200, description: '매장 소유자 삭제 성공' },
  },
  badRequestResponse: { status: 400, description: '잘못된 요청' },
  unauthorizedResponse: { status: 401, description: '인증되지 않은 요청' },
  notFoundResponse: { status: 404, description: '매장 소유자를 찾을 수 없음' },
};

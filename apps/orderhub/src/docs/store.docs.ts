export const storeDocs = {
  create: {
    summary: '매장 생성',
  },
  getList: {
    summary: '매장 목록 조회',
    successResponse: { status: 200, description: '매장 목록 반환' },
  },
  getUnique: {
    summary: '특정 매장 조회',
    successResponse: { status: 200, description: '매장 정보 반환' },
  },
  delete: {
    summary: '매장 삭제',
  },
  notImplementedResponse: { status: 501, description: '구현 예정' },
  unauthorizedResponse: { status: 401, description: '인증되지 않은 요청' },
  notFoundResponse: { status: 404, description: '매장을 찾을 수 없음' },
};

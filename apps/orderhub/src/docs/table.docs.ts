export const tableDocs = {
  create: {
    summary: '테이블 생성',
    successResponse: { status: 201, description: '테이블 생성 성공' },
  },
  getList: {
    summary: '테이블 목록 조회',
    successResponse: { status: 200, description: '테이블 목록 반환' },
  },
  getUnique: {
    summary: '특정 테이블 조회',
    successResponse: { status: 200, description: '테이블 정보 반환' },
  },
  update: {
    summary: '테이블 정보 수정',
    successResponse: { status: 200, description: '테이블 수정 성공' },
  },
  delete: {
    summary: '테이블 삭제',
    successResponse: { status: 200, description: '테이블 삭제 성공' },
  },
  badRequestResponse: { status: 400, description: '잘못된 요청' },
  unauthorizedResponse: { status: 401, description: '인증되지 않은 요청' },
  notFoundResponse: { status: 404, description: '테이블을 찾을 수 없음' },
};

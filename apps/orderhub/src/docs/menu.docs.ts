export const menuDocs = {
  create: {
    summary: '메뉴 생성',
    successResponse: { status: 201, description: '메뉴 생성 성공' },
  },
  getList: {
    summary: '메뉴 목록 조회',
    successResponse: { status: 200, description: '메뉴 목록 반환' },
  },
  getUnique: {
    summary: '특정 메뉴 조회',
    successResponse: { status: 200, description: '메뉴 정보 반환' },
  },
  update: {
    summary: '메뉴 수정',
    successResponse: { status: 200, description: '메뉴 수정 성공' },
  },
  delete: {
    summary: '메뉴 삭제 (소프트 삭제)',
    successResponse: { status: 200, description: '메뉴 삭제 성공' },
  },
  badRequestResponse: { status: 400, description: '잘못된 요청' },
  unauthorizedResponse: { status: 401, description: '인증되지 않은 요청' },
  notFoundResponse: { status: 404, description: '메뉴를 찾을 수 없음' },
};

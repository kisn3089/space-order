export const orderDocs = {
  create: {
    summary: '주문 생성',
    successResponse: { status: 201, description: '주문 생성 성공' },
  },
  getList: {
    summary: '주문 목록 조회',
    successResponse: { status: 200, description: '주문 목록 반환' },
  },
  getUnique: {
    summary: '특정 주문 조회',
    successResponse: { status: 200, description: '주문 정보 반환' },
  },
  update: {
    summary: '주문 수정',
    successResponse: { status: 200, description: '주문 수정 성공' },
  },
  delete: {
    summary: '주문 취소',
    successResponse: { status: 200, description: '주문 취소 성공' },
  },
  badRequestResponse: { status: 400, description: '잘못된 요청' },
  unauthorizedResponse: { status: 401, description: '세션 인증 실패' },
  notFoundResponse: { status: 404, description: '주문을 찾을 수 없음' },
};

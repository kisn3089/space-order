export const ownerOrderDocs = {
  create: {
    summary: '주문 생성 (점주)',
    successResponse: { status: 201, description: '주문 생성 성공' },
  },
  getList: {
    summary: '주문 목록 조회 (점주)',
    successResponse: { status: 200, description: '주문 목록 반환' },
  },
  getActiveSessionOrders: {
    summary: '테이블 활성 세션 주문 목록 조회 (점주)',
    successResponse: {
      status: 200,
      description: '활성 세션의 주문 목록 반환 (활성 세션이 없으면 빈 배열)',
    },
  },
  getUnique: {
    summary: '특정 주문 조회 (점주)',
    successResponse: { status: 200, description: '주문 정보 반환' },
  },
  update: {
    summary: '주문 수정 (점주)',
    successResponse: { status: 200, description: '주문 수정 성공' },
  },
  cancel: {
    summary: '주문 취소 (점주)',
    successResponse: { status: 200, description: '주문 취소 성공' },
  },
  badRequestResponse: { status: 400, description: '잘못된 요청' },
  unauthorizedResponse: { status: 401, description: '인증되지 않은 요청' },
  notFoundResponse: { status: 404, description: '주문을 찾을 수 없음' },
};

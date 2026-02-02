export const meDocs = {
  find: {
    summary: '현재 로그인한 사용자 정보 조회',
    successResponse: { status: 200, description: '사용자 정보 반환' },
  },
  unauthorizedResponse: { status: 401, description: '인증되지 않은 요청' },
};

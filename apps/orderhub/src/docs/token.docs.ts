export const tokenDocs = {
  signIn: {
    summary: '로그인을 수행하여 토큰을 발급',
    successResponse: {
      status: 200,
      description: '사용자 인증을 통해 액세스 토큰 발급',
    },
  },
  refresh: {
    summary: '쿠키의 리프레시 토큰으로 액세스 토큰 재발급',
    successResponse: {
      status: 200,
      description: '리프레시 토큰을 통해 액세스 토큰 재발급',
    },
  },
  unauthorizedResponse: { status: 401, description: '인증되지 않은 사용자' },
};

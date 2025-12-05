import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 네트워크 요청을 http 요청으로 변환하고 passport local 전략에서 인증되어 요청 req에 저장된 user 값을,
 * 이후 사용할 controller method parameter로 주입하는 커스텀 데코레이터
 */
const getCurrentAdminByContext = (context: ExecutionContext) => {
  console.log('qqqqqqqqqq: ', context.switchToHttp().getRequest().user);

  return context.switchToHttp().getRequest().user;
};

export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentAdminByContext(context),
);

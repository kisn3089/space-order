import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getCurrentAdminByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest().user;
};

export const JwtUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getCurrentAdminByContext(context),
);

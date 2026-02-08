import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getClientByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest().user.jwt;
};

export const Jwt = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getClientByContext(context),
);

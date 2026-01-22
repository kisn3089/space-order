import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getMenuByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest().menu;
};

export const CachedMenuByGuard = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getMenuByContext(context),
);

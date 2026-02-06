import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getOrderByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest().store;
};

export const CachedStoreByGuard = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getOrderByContext(context),
);

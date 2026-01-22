import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getOrderByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest().orderItem;
};

export const CachedOrderItemByGuard = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getOrderByContext(context),
);

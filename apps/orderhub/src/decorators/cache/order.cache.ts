import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getOrderByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest().order;
};

export const CachedOrder = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getOrderByContext(context),
);

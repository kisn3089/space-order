import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getTableByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest().table;
};

export const CachedTableByGuard = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => getTableByContext(context),
);

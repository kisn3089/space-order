import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const getTableSessionByContext = (context: ExecutionContext) => {
  return context.switchToHttp().getRequest().tableSession;
};

export const Session = createParamDecorator(
  (_data: unknown, context: ExecutionContext) =>
    getTableSessionByContext(context),
);

import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

interface Schemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const ZodValidation = (schemas: Schemas) => {
  return createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const { body, params, query } = request;

    if (schemas?.body && body) {
      const bodyResult = schemas.body.safeParse(body);

      if (!bodyResult.success) {
        throw new HttpException('Invalid request body', 400);
      }
      return body;
    }

    if (schemas?.params && params) {
      const paramsResult = schemas.params.safeParse(params);

      if (!paramsResult.success) {
        throw new HttpException('Invalid request params', 400);
      }
      return params;
    }

    if (schemas?.query && query) {
      const queryResult = schemas.query.safeParse(query);
      if (!queryResult.success) {
        throw new HttpException('Invalid request query', 400);
      }
      return query;
    }
    return null;
  })();
};

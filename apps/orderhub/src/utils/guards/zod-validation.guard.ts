import {
  CanActivate,
  ExecutionContext,
  Injectable,
  mixin,
  Type,
  BadRequestException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

interface Schemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export function ZodValidationGuard(schemas: Schemas): Type<CanActivate> {
  @Injectable()
  class ZodValidationGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const { body, params, query } = request;

      if (schemas?.body && body) {
        const bodyResult = schemas.body.safeParse(body);

        if (!bodyResult.success) {
          throw new BadRequestException({
            message: 'Invalid request body',
            errors: bodyResult.error.errors,
          });
        }
        request.body = bodyResult.data;
      }

      if (schemas?.params && params) {
        const paramsResult = schemas.params.safeParse(params);

        if (!paramsResult.success) {
          throw new BadRequestException({
            message: 'Invalid request params',
            errors: paramsResult.error.errors,
          });
        }
        request.params = paramsResult.data;
      }

      if (schemas?.query && query) {
        const queryResult = schemas.query.safeParse(query);
        if (!queryResult.success) {
          throw new BadRequestException({
            message: 'Invalid request query',
            errors: queryResult.error.errors,
          });
        }
        request.query = queryResult.data;
      }

      return true;
    }
  }

  return mixin(ZodValidationGuardMixin);
}

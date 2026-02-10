import { createSessionSchema } from '@spaceorder/api/schemas/model/tableSession.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateSessionPayloadDto extends createZodDto(
  createSessionSchema,
) {}

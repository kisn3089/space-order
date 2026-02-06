import { updateOwnerPayloadSchema } from '@spaceorder/api/schemas/model/owner.schema';
import { createZodDto } from 'nestjs-zod';

export class UpdateOwnerPayloadDto extends createZodDto(
  updateOwnerPayloadSchema,
) {}

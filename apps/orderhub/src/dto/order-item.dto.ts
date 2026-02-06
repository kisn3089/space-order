import {
  createOrderItemPayloadSchema,
  partialUpdateOrderItemPayloadSchema,
} from '@spaceorder/api/schemas/model/orderItem.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateOrderItemPayloadDto extends createZodDto(
  createOrderItemPayloadSchema,
) {}
export class UpdateOrderItemPayloadDto extends createZodDto(
  partialUpdateOrderItemPayloadSchema,
) {}

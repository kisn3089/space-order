import {
  createOrderItemSchema,
  partialUpdateOrderItemSchema,
} from '@spaceorder/api/schemas/model/orderItem.schema';
import { createZodDto } from 'nestjs-zod';

export class CreateOrderItemPayloadDto extends createZodDto(
  createOrderItemSchema,
) {}
export class UpdateOrderItemPayloadDto extends createZodDto(
  partialUpdateOrderItemSchema,
) {}

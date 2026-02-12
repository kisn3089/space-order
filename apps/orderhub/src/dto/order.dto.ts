import {
  createOrderPayloadSchema,
  updateOrderPayloadSchema,
} from "@spaceorder/api/schemas/model/order.schema";
import { createZodDto } from "nestjs-zod";

export class CreateOrderPayloadDto extends createZodDto(
  createOrderPayloadSchema
) {}
export class UpdateOrderPayloadDto extends createZodDto(
  updateOrderPayloadSchema
) {}

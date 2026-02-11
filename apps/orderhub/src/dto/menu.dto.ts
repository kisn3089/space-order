import {
  createMenuPayloadSchema,
  updateMenuPayloadSchema,
} from "@spaceorder/api/schemas/model/menu.schema";
import { createZodDto } from "nestjs-zod";

export class CreateMenuPayloadDto extends createZodDto(
  createMenuPayloadSchema
) {}
export class UpdateMenuPayloadDto extends createZodDto(
  updateMenuPayloadSchema
) {}

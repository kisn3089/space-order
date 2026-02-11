import {
  createTablePayloadSchema,
  updateTablePayloadSchema,
} from "@spaceorder/api/schemas/model/table.schema";
import { createZodDto } from "nestjs-zod";

export class CreateTablePayloadDto extends createZodDto(
  createTablePayloadSchema
) {}
export class UpdateTablePayloadDto extends createZodDto(
  updateTablePayloadSchema
) {}

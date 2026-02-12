import {
  createOwnerPayloadSchema,
  updateOwnerPayloadSchema,
} from "@spaceorder/api/schemas/model/owner.schema";
import { createZodDto } from "nestjs-zod";

export class CreateOwnerPayloadDto extends createZodDto(
  createOwnerPayloadSchema
) {}
export class UpdateOwnerPayloadDto extends createZodDto(
  updateOwnerPayloadSchema
) {}

import {
  createAdminPayloadSchema,
  updateAdminPayloadSchema,
} from "@spaceorder/api/schemas/model/admin.schema";
import { createZodDto } from "nestjs-zod";

export class CreateAdminPayloadDto extends createZodDto(
  createAdminPayloadSchema
) {}

export class UpdateAdminPayloadDto extends createZodDto(
  updateAdminPayloadSchema
) {}

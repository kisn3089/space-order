import { signInPayloadSchema } from "@spaceorder/api/schemas/signIn.schema";
import { createZodDto } from "nestjs-zod";

export class SignInPayloadDto extends createZodDto(signInPayloadSchema) {}

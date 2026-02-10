import { createOwnerPayloadSchema } from "./model/owner.schema";

export const signInPayloadSchema = createOwnerPayloadSchema.pick({
  email: true,
  password: true,
});

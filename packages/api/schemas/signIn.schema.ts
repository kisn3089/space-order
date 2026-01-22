import { createOwnerSchema } from "./model/owner.schema";

export const signInFormSchema = createOwnerSchema.pick({
  email: true,
  password: true,
});

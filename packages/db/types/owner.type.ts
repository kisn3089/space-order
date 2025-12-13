import { Owner } from "@prisma/client";

export type PlainOwner = Omit<Owner, "id" | "refreshToken" | "password"> & {
  role: "owner" | "admin";
};

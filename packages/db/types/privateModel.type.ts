import { Store, Table, TableSession } from "@prisma/client";

export type SessionWithSanitizeId = TableSession & {
  table: Table & { store: Pick<Store, "publicId" | "id"> };
};

export type TableAndStoreOwnerId = Table & {
  store: Pick<Store, "ownerId">;
};

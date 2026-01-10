import { Store, Table, TableSession } from "@prisma/client";

export type SessionWithTableAndStoreId = TableSession & {
  table: Table & { store: Pick<Store, "publicId" | "id"> };
};

export type TableAndStoreOwnerId = Table & {
  store: Pick<Store, "ownerId">;
};

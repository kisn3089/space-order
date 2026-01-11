import { Store, Table, TableSession } from "@prisma/client";

export type SessionWithTable = TableSession & {
  table: Table;
};

export type TableAndStoreOwnerId = Table & {
  store: Pick<Store, "ownerId">;
};

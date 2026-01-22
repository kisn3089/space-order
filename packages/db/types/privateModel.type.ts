import { Store, Table, TableSession } from "@prisma/client";

export type SessionWithTable = TableSession & {
  table: Table;
};

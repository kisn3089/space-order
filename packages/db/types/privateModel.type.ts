import { Admin, Owner, Table, TableSession } from "@prisma/client";

export type SessionWithTable = TableSession & {
  table: Table;
};

export type User = Owner | Admin;

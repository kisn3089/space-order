import { Menu, Store, Table } from "@prisma/client";

export type TableWithStoreContext = Table & {
  store: Store & { menus: Menu[] };
};

import type {
  Menu,
  Order,
  OrderItem,
  Owner,
  Store,
  Table,
  TableSession,
} from "@prisma/client";

export type PublicOwner = Omit<Owner, "id" | "refreshToken" | "password">;
// type OwnerRole = "owner" | "admin";

export type PublicTable = Omit<Table, "id" | "storeId">;

export type PublicTableSession = Omit<TableSession, "id" | "tableId">;

export type PublicOrder = Omit<
  Order,
  "id" | "storeId" | "tableId" | "tableSessionId"
>;
export type PublicOrderWithItem = PublicOrder & {
  orderItems: PublicOrderItem[];
};

export type PublicOrderItem = Omit<OrderItem, "id" | "orderId" | "menuId">;

export type PublicMenu = Omit<Menu, "id" | "storeId">;

export type PublicStore = Omit<Store, "id" | "ownerId">;

// Store with nested tables, orders, and order items
// All nested arrays can be empty (tables: [], orders: [], orderItems: [])

export type PublicTableWithOrders = PublicTableSession & {
  orders?: PublicOrderWithItem[];
};

export type PublicTableSessionWithTable = PublicTable & {
  tableSessions?: PublicTableWithOrders[];
};

export type PublicStoreWithTablesAndOrders = PublicStore & {
  tables?: PublicTableSessionWithTable[];
};

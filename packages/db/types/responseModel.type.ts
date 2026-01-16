import type {
  Menu,
  Order,
  OrderItem,
  Owner,
  Store,
  Table,
  TableSession,
} from "@prisma/client";

export type ResponseOwner = Omit<Owner, "id" | "refreshToken" | "password">;
// type OwnerRole = "owner" | "admin";

export type ResponseTable = Omit<Table, "id" | "storeId">;

export type ResponseTableSession = Omit<TableSession, "id" | "tableId">;

export type ResponseOrder = Omit<
  Order,
  "id" | "storeId" | "tableId" | "tableSessionId"
>;

export type ResponseOrderItem = Omit<OrderItem, "id" | "orderId" | "menuId">;

export type ResponseMenu = Omit<Menu, "id" | "storeId">;

export type ResponseStore = Omit<Store, "id" | "ownerId">;

export type ResponseOrderWithItem = ResponseOrder & {
  orderItems: ResponseOrderItem[];
};
export type ResponseSessionsWithOrders = ResponseTableSession & {
  orders: ResponseOrderWithItem[];
};
export type ResponseTableWithSessions = ResponseTable & {
  tableSessions: ResponseSessionsWithOrders[];
};
export type ResponseStoreWithTables = ResponseStore & {
  tables: ResponseTableWithSessions[];
};

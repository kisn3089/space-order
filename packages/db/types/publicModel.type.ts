import type {
  Menu,
  Order,
  OrderItem,
  Owner,
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
> & { orderItems: PublicOrderItem[] };

export type PublicOrderItem = Omit<OrderItem, "id" | "orderId" | "menuId">;

export type PublicMenu = Omit<Menu, "id" | "storeId">;

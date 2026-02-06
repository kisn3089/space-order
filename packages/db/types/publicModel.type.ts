import type {
  Menu,
  Order,
  OrderItem,
  Owner,
  Store,
  Table,
  TableSession,
} from "@prisma/client";
import { OrderItemOptionSnapshot } from "./menuOptions.type";

export type ExtendedResponseTable = PublicTable & {
  tableSessions?: PublicSession[];
  orders?: Array<PublicOrder & { orderItems?: PublicOrderItem[] }>;
};

export type PublicOwner = Omit<Owner, "id" | "refreshToken" | "password">;

export type PublicTable = Omit<Table, "id" | "storeId">;

export type PublicSession = Omit<TableSession, "id" | "tableId">;

export type PublicOrder = Omit<
  Order,
  "id" | "storeId" | "tableId" | "tableSessionId"
>;

type PublicizeOrderItem = Omit<OrderItem, "id" | "orderId" | "menuId">;
export type PublicOrderItem<Option extends "Narrow" | "Wide" = "Narrow"> =
  Option extends "Narrow"
    ? Omit<PublicizeOrderItem, "optionsSnapshot"> & {
        optionsSnapshot?: OrderItemOptionSnapshot | null;
      }
    : PublicizeOrderItem;

export type PublicMenu = Omit<Menu, "id" | "storeId">;

export type PublicStore = Omit<Store, "id" | "ownerId">;

export type PublicOrderWithItem<Option extends "Narrow" | "Wide" = "Narrow"> =
  PublicOrder & {
    orderItems: PublicOrderItem<Option>[];
  };

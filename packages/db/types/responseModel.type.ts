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

export type ExtendedResponseTable = ResponseTable & {
  tableSessions?: ResponseTableSession[];
  orders?: Array<ResponseOrder & { orderItems?: ResponseOrderItem[] }>;
};

export type ResponseOwner = Omit<Owner, "id" | "refreshToken" | "password">;
// type OwnerRole = "owner" | "admin";

export type ResponseTable = Omit<Table, "id" | "storeId">;

export type ResponseTableSession = Omit<TableSession, "id" | "tableId">;

export type ResponseOrder = Omit<
  Order,
  "id" | "storeId" | "tableId" | "tableSessionId"
>;

type SanitizedOrderItem = Omit<OrderItem, "id" | "orderId" | "menuId">;
export type ResponseOrderItem<Option extends "Narrow" | "Wide" = "Narrow"> =
  Option extends "Narrow"
    ? Omit<SanitizedOrderItem, "optionsSnapshot"> & {
        optionsSnapshot?: OrderItemOptionSnapshot | null;
      }
    : SanitizedOrderItem;

export type ResponseMenu = Omit<Menu, "id" | "storeId">;

export type ResponseStore = Omit<Store, "id" | "ownerId">;

export type ResponseOrderWithItem<Option extends "Narrow" | "Wide" = "Narrow"> =
  ResponseOrder & {
    orderItems: ResponseOrderItem<Option>[];
  };
type ResponseSessionsWithOrders = ResponseTableSession & {
  orders: ResponseOrderWithItem[];
};
export type ResponseTableWithSessions = ResponseTable & {
  tableSessions: ResponseSessionsWithOrders[];
};

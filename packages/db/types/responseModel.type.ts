import type {
  Menu,
  Order,
  OrderItem,
  Owner,
  Store,
  Table,
  TableSession,
} from "@prisma/client";

/** TODO: query의 include 값에 따라 타입이 동적 할당되도록 유틸 함수 만들자. */
export type ExtendedResponseTable = ResponseTable & {
  tableSessions?: ResponseTableSession[];
  store?: ResponseStore;
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

export type SummarizedOrderItem = Pick<
  ResponseOrderItem,
  "publicId" | "menuName" | "quantity"
>;
export type SummarizedOrder = Pick<ResponseOrder, "publicId" | "status">;
export type SummarizedTableSession = Pick<
  ResponseTableSession,
  "publicId" | "expiresAt"
>;

export type SummarizedOrderWithItem = SummarizedOrder & {
  orderItems: SummarizedOrderItem[];
};
export type SummarizedSessionWithOrders = SummarizedTableSession & {
  orders: SummarizedOrderWithItem[];
};
export type SummarizedTableWithSessions = ResponseTable & {
  tableSessions?: SummarizedSessionWithOrders[];
};
export type SummarizedOrdersFromStore = ResponseStore & {
  tables: SummarizedTableWithSessions[];
};

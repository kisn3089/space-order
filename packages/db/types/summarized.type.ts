import {
  ResponseOrder,
  ResponseOrderItem,
  ResponseStore,
  ResponseTable,
  ResponseTableSession,
} from "./responseModel.type";

type SummarizedOrderItem = Pick<
  ResponseOrderItem,
  "publicId" | "menuName" | "quantity"
>;
export type SummarizedOrder = Pick<ResponseOrder, "publicId" | "status">;
type SummarizedTableSession = Pick<
  ResponseTableSession,
  "publicId" | "expiresAt"
>;

export type SummarizedOrderWithItem = SummarizedOrder & {
  orderItems: SummarizedOrderItem[];
};
type SummarizedSessionWithOrders = SummarizedTableSession & {
  orders: SummarizedOrderWithItem[];
};
export type SummarizedTableWithSessions = ResponseTable & {
  tableSessions?: SummarizedSessionWithOrders[];
};
export type SummarizedOrdersFromStore = ResponseStore & {
  tables: SummarizedTableWithSessions[];
};

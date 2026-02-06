import {
  PublicOrder,
  PublicOrderItem,
  PublicTable,
  PublicSession,
} from "./publicModel.type";

type SummarizedOrderItem = Pick<
  PublicOrderItem,
  "publicId" | "menuName" | "quantity"
>;
export type SummarizedOrder = Pick<PublicOrder, "publicId" | "status">;
type SummarizedTableSession = Pick<PublicSession, "publicId" | "expiresAt">;

export type SummarizedOrderWithItem = SummarizedOrder & {
  orderItems: SummarizedOrderItem[];
};
type SummarizedSessionWithOrders = SummarizedTableSession & {
  orders: SummarizedOrderWithItem[];
};
export type SummarizedTableWithSessions = PublicTable & {
  tableSessions?: SummarizedSessionWithOrders[];
};
export type SummarizedOrdersByStore = SummarizedTableWithSessions[];

import {
  OrderStatus,
  PublicOrderItem,
  PublicOrderWithItem,
} from "@spaceorder/db";
import { http } from "../axios";

const prefix = (storeId: string, tableId: string) =>
  `/owner/stores/${storeId}/tables/${tableId}/orders`;

export type FetchOrderParams = {
  storeId: string;
  tableId: string;
};
async function fetchList({
  storeId,
  tableId,
}: FetchOrderParams): Promise<PublicOrderWithItem[]> {
  const response = await http.get<PublicOrderWithItem[]>(
    `${prefix(storeId, tableId)}`
  );
  return response.data;
}

export type FetchOrderUniqueParams = FetchOrderParams & {
  orderId: string;
};
async function fetchUnique({
  storeId,
  tableId,
  orderId,
}: FetchOrderUniqueParams): Promise<PublicOrderWithItem> {
  const response = await http.get<PublicOrderWithItem>(
    `${prefix(storeId, tableId)}/${orderId}`
  );
  return response.data;
}

export type CreateOwnerOrderPayload = {
  orderItems: Array<
    { menuPublicId: string } & Pick<PublicOrderItem, "quantity"> &
      Partial<Pick<PublicOrderItem, "menuName" | "options">>
  >;
  memo?: string;
  totalPrice?: number;
};
async function createOwnerOrder(
  { storeId, tableId }: FetchOrderParams,
  createOrderPayload: CreateOwnerOrderPayload
): Promise<PublicOrderWithItem> {
  const reponse = await http.post<PublicOrderWithItem>(
    `${prefix(storeId, tableId)}`,
    createOrderPayload
  );
  return reponse.data;
}

export type UpdateOwnerOrderPayload = Partial<
  CreateOwnerOrderPayload & {
    status: OrderStatus;
    cancelledReason: string;
  }
>;
async function updateOwnerOrder(
  { orderId, storeId, tableId }: FetchOrderUniqueParams,
  updateOrderPayload: UpdateOwnerOrderPayload
) {
  const response = await http.patch<PublicOrderWithItem>(
    `${prefix(storeId, tableId)}/${orderId}`,
    updateOrderPayload
  );
  return response.data;
}

export const httpOrders = {
  fetchList,
  fetchUnique,
  createOwnerOrder,
  updateOwnerOrder,
};

import {
  OrderStatus,
  ResponseOrderItem,
  ResponseOrderWithItem,
} from "@spaceorder/db";
import { http } from "../axios";

function prefix(storeId: string, tableId: string) {
  return `/owner/stores/${storeId}/tables/${tableId}/orders`;
}

export type CreateOwnerOrderPayload = {
  orderItems: Array<
    { menuPublicId: string } & Pick<ResponseOrderItem, "quantity"> &
      Partial<Pick<ResponseOrderItem, "menuName" | "options">>
  >;
  memo?: string;
};
async function createOwnerOrder(
  { storeId, tableId }: FetchOrderParams,
  createOrderPayload: CreateOwnerOrderPayload
): Promise<ResponseOrderWithItem> {
  const reponse = await http.post<ResponseOrderWithItem>(
    `${prefix(storeId, tableId)}`,
    createOrderPayload
  );
  return reponse.data;
}

export type FetchOrderParams = {
  storeId: string;
  tableId: string;
};
async function fetchList({
  storeId,
  tableId,
}: FetchOrderParams): Promise<ResponseOrderWithItem[]> {
  const response = await http.get<ResponseOrderWithItem[]>(
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
}: FetchOrderUniqueParams): Promise<ResponseOrderWithItem> {
  const response = await http.get<ResponseOrderWithItem>(
    `${prefix(storeId, tableId)}/${orderId}`
  );
  return response.data;
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
  const response = await http.patch<ResponseOrderWithItem>(
    `${prefix(storeId, tableId)}/${orderId}`,
    updateOrderPayload
  );
  return response.data;
}

export const httpOrder = {
  createOwnerOrder,
  fetchList,
  fetchUnique,
  updateOwnerOrder,
};

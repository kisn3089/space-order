import {
  OrderStatus,
  PublicOrderItem,
  PublicOrderWithItem,
} from "@spaceorder/db";
import { http } from "../axios";

function prefix(storeId: string, tableId: string) {
  return `/owner/stores/${storeId}/tables/${tableId}/orders`;
}

type ItemOption = Record<string, string>;
type OrderItemOption = {
  requiredOptions?: ItemOption;
  customOptions?: ItemOption;
};
export type CreateOwnerOrderPayload = {
  orderItems: Array<
    { menuPublicId: string } & Pick<PublicOrderItem, "quantity"> &
      Partial<Pick<PublicOrderItem, "menuName"> & OrderItemOption>
  >;
  memo?: string;
};
async function createOwnerOrder(
  { storeId, tableId }: FetchOrderParams,
  createOrderPayload: CreateOwnerOrderPayload
): Promise<PublicOrderWithItem> {
  const response = await http.post<PublicOrderWithItem>(
    `${prefix(storeId, tableId)}`,
    createOrderPayload
  );
  return response.data;
}

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

export const httpOrder = {
  createOwnerOrder,
  fetchList,
  fetchUnique,
  updateOwnerOrder,
};

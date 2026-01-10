import { PublicOrder } from "@spaceorder/db";
import { http } from "../axios";

const prefix = (storeId: string, tableId: string) =>
  `/stores/${storeId}/tables/${tableId}/orders`;

export type FetchOrderListParams = {
  storeId: string;
  tableId: string;
};
async function fetchList({
  storeId,
  tableId,
}: FetchOrderListParams): Promise<PublicOrder[]> {
  const response = await http.get<PublicOrder[]>(`${prefix(storeId, tableId)}`);
  return response.data;
}

export type FetchOrderUniqueParams = {
  storeId: string;
  tableId: string;
  orderId: string;
};
async function fetchUnique({
  storeId,
  tableId,
  orderId,
}: FetchOrderUniqueParams): Promise<PublicOrder> {
  const response = await http.get<PublicOrder>(
    `${prefix(storeId, tableId)}/${orderId}`
  );
  return response.data;
}

export const httpOrders = {
  fetchList,
  fetchUnique,
};

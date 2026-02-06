import {
  OrderStatus,
  PublicOrderItem,
  PublicOrderWithItem,
} from "@spaceorder/db";
import { http } from "../axios";

function prefix(storeId: string) {
  return `/owner/v1/stores/${storeId}`;
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

export type CreateOwnerOrderParams = {
  storeId: string;
  tableId: string;
};

async function createOwnerOrder(
  { storeId, tableId }: CreateOwnerOrderParams,
  createOrderPayload: CreateOwnerOrderPayload
): Promise<PublicOrderWithItem> {
  const response = await http.post<PublicOrderWithItem>(
    `${prefix(storeId)}/tables/${tableId}/orders`,
    createOrderPayload
  );
  return response.data;
}

export type UpdateOwnerOrderPayload = Partial<
  CreateOwnerOrderPayload & {
    status: OrderStatus;
    cancelledReason: string;
  }
>;

export type UpdateOwnerOrderParams = {
  storeId: string;
  orderId: string;
};

async function updateOwnerOrder(
  { orderId, storeId }: UpdateOwnerOrderParams,
  updateOrderPayload: UpdateOwnerOrderPayload
) {
  const response = await http.patch<PublicOrderWithItem>(
    `${prefix(storeId)}/orders/${orderId}`,
    updateOrderPayload
  );
  return response.data;
}

export const httpOrder = {
  createOwnerOrder,
  updateOwnerOrder,
};

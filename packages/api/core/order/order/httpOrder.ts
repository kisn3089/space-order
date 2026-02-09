import {
  OrderStatus,
  PublicOrderItem,
  PublicOrderWithItem,
} from "@spaceorder/db";
import { http } from "../../axios";

const prefix = "/orders/v1";

type ItemOption = Record<string, string>;
type OrderItemOption = {
  requiredOptions?: ItemOption;
  customOptions?: ItemOption;
};
export type CreateOrderByTablePayload = {
  orderItems: Array<
    { menuPublicId: string } & Pick<PublicOrderItem, "quantity"> &
      Partial<Pick<PublicOrderItem, "menuName"> & OrderItemOption>
  >;
  memo?: string;
};

async function createOrderByTable(
  tableId: string,
  createOrderPayload: CreateOrderByTablePayload
): Promise<PublicOrderWithItem> {
  const response = await http.post<PublicOrderWithItem>(
    `${prefix}/tables/${tableId}/orders`,
    createOrderPayload
  );
  return response.data;
}

export type UpdateOrderByTablePayload = Partial<
  CreateOrderByTablePayload & {
    status: OrderStatus;
    cancelledReason: string;
  }
>;

async function updateOrderByTable(
  orderId: string,
  updateOrderPayload: UpdateOrderByTablePayload
) {
  const response = await http.patch<PublicOrderWithItem>(
    `${prefix}/${orderId}`,
    updateOrderPayload
  );
  return response.data;
}

export const httpOrder = {
  createOrderByTable,
  updateOrderByTable,
};

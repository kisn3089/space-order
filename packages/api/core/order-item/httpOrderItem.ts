import { ResponseOrderItem } from "@spaceorder/db";
import { http } from "../axios";
import z from "zod";
import { createOrderItemSchema } from "../../schemas/model/orderItem.schema";

function prefix(orderId: string) {
  return `/orders/${orderId}/order-items`;
}

type CreateOrderItemPayload = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderItemPayload = Partial<
  Omit<CreateOrderItemPayload, "menuName">
>;

type FetchOrderItemParams = { orderId: string };
async function updateOrderItem(
  { orderId, orderItemId }: FetchOrderItemParams & { orderItemId: string },
  updateOrderItemPayload: UpdateOrderItemPayload
) {
  const response = await http.patch<ResponseOrderItem>(
    `${prefix(orderId)}/${orderItemId}`,
    updateOrderItemPayload
  );
  return response.data;
}

export const httpOrderItems = {
  updateOrderItem,
};

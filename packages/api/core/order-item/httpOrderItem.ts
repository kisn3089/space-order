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
export type FetchOrderItemUnique = FetchOrderItemParams & {
  orderItemId: string;
};
async function updateOrderItem(
  { orderId, orderItemId }: FetchOrderItemUnique,
  updateOrderItemPayload: UpdateOrderItemPayload
): Promise<ResponseOrderItem<"Narrow">> {
  const response = await http.patch<ResponseOrderItem<"Narrow">>(
    `${prefix(orderId)}/${orderItemId}`,
    updateOrderItemPayload
  );
  return response.data;
}

async function removeOrderItem({
  orderId,
  orderItemId,
}: FetchOrderItemUnique): Promise<void> {
  const response = await http.delete<void>(`${prefix(orderId)}/${orderItemId}`);
  return response.data;
}

export const httpOrderItems = {
  updateOrderItem,
  removeOrderItem,
};

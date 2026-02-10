import { PublicOrderItem } from "@spaceorder/db";
import { http } from "../../axios";
import z from "zod";
import { createOrderItemPayloadSchema } from "../../../schemas/model/orderItem.schema";

const prefix = "/orders/v1";

type CreateOrderItemPayload = z.infer<typeof createOrderItemPayloadSchema>;
export type UpdateOrderItemPayload = Partial<
  Omit<CreateOrderItemPayload, "menuName">
>;

async function updateOrderItem(
  orderItemId: string,
  updateOrderItemPayload: UpdateOrderItemPayload
): Promise<PublicOrderItem> {
  const response = await http.patch<PublicOrderItem>(
    `${prefix}/order-items/${orderItemId}`,
    updateOrderItemPayload
  );
  return response.data;
}

async function removeOrderItem(orderItemId: string): Promise<void> {
  const response = await http.delete<void>(
    `${prefix}/order-items/${orderItemId}`
  );
  return response.data;
}

export const httpOrderItems = {
  updateOrderItem,
  removeOrderItem,
};

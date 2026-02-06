import { PublicOrderItem } from "@spaceorder/db";
import { http } from "../axios";
import z from "zod";
import { createOrderItemPayloadSchema } from "../../schemas/model/orderItem.schema";

function prefix(storeId: string) {
  return `/owner/v1/stores/${storeId}`;
}

type CreateOrderItemPayload = z.infer<typeof createOrderItemPayloadSchema>;
export type UpdateOrderItemPayload = Partial<
  Omit<CreateOrderItemPayload, "menuName">
>;

type FetchStoreIdParams = { storeId: string };
type FetchOrderItemUnique = FetchStoreIdParams & {
  orderItemId: string;
};
async function updateOrderItem(
  { storeId, orderItemId }: FetchOrderItemUnique,
  updateOrderItemPayload: UpdateOrderItemPayload
): Promise<PublicOrderItem> {
  const response = await http.patch<PublicOrderItem>(
    `${prefix(storeId)}/order-items/${orderItemId}`,
    updateOrderItemPayload
  );
  return response.data;
}

async function removeOrderItem({
  storeId,
  orderItemId,
}: FetchOrderItemUnique): Promise<void> {
  const response = await http.delete<void>(
    `${prefix(storeId)}/order-items/${orderItemId}`
  );
  return response.data;
}

export const httpOrderItems = {
  updateOrderItem,
  removeOrderItem,
};

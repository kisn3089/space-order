import {
  Cart,
  PublicCartItem,
  CartWithNotice,
  CartWithOptionalNotice,
} from "@spaceorder/db";
import { http } from "../axios";

const prefix = "/carts/v1";

export type AddCartItemPayload = Pick<
  PublicCartItem,
  "menuPublicId" | "quantity" | "requiredOptions" | "customOptions"
>;

export type UpdateCartItemPayload = Omit<AddCartItemPayload, "menuPublicId">;

async function getCart(): Promise<Cart> {
  const res = await http.get<Cart>(`${prefix}/sessions/carts`);
  return res.data;
}

async function addCartItem(
  payload: AddCartItemPayload
): Promise<CartWithNotice> {
  const res = await http.post<CartWithNotice>(
    `${prefix}/sessions/carts`,
    payload
  );
  return res.data;
}

async function updateCartItem(
  cartItemId: string,
  payload: UpdateCartItemPayload
): Promise<CartWithOptionalNotice> {
  const res = await http.patch<CartWithOptionalNotice>(
    `${prefix}/sessions/carts/${cartItemId}`,
    payload
  );
  return res.data;
}

async function removeCartItem(cartItemId: string): Promise<CartWithNotice> {
  const res = await http.delete<CartWithNotice>(
    `${prefix}/sessions/carts/${cartItemId}`
  );
  return res.data;
}

async function clearCart(): Promise<void> {
  await http.delete(`${prefix}/sessions/carts`);
}

/**
 * Owner용 - Authorization 헤더는 axios 인터셉터에서 자동 설정
 */
async function getCartByOwner(
  storeId: string,
  sessionToken: string
): Promise<Cart> {
  const res = await http.get<Cart>(
    `${prefix}/stores/${storeId}/sessions/${sessionToken}/carts`
  );
  return res.data;
}

export const httpCart = {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  getCartByOwner,
};

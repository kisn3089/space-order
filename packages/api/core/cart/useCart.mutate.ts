import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type AddCartItemPayload,
  type UpdateCartItemPayload,
  httpCart,
} from "./httpCart";
import { pathToQueryKey } from "../../utils/pathToQueryKey";

const cartQueryKey = pathToQueryKey("/carts/v1/sessions/carts");

export function useCartMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: cartQueryKey });

  const add = useMutation({
    mutationKey: ["cart", "add"],
    mutationFn: (payload: AddCartItemPayload) => httpCart.addCartItem(payload),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationKey: ["cart", "update"],
    mutationFn: ({
      cartItemId,
      payload,
    }: {
      cartItemId: string;
      payload: UpdateCartItemPayload;
    }) => httpCart.updateCartItem(cartItemId, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationKey: ["cart", "remove"],
    mutationFn: (cartItemId: string) => httpCart.removeCartItem(cartItemId),
    onSuccess: invalidate,
  });

  const clearCart = useMutation({
    mutationKey: ["cart", "clear"],
    mutationFn: () => httpCart.clearCart(),
    onSuccess: invalidate,
  });

  return { add, update, remove, clearCart };
}

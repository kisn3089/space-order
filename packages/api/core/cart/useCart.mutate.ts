import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  type AddCartItemPayload,
  type UpdateCartItemPayload,
  httpCart,
} from "./httpCart";
import { pathToQueryKey } from "../../utils/pathToQueryKey";
import { Cart } from "@spaceorder/db";

const cartQueryKey = pathToQueryKey("/carts/v1/sessions/carts");

export function useCartMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: cartQueryKey });

  const add = useMutation({
    mutationKey: ["cart", "add"],
    mutationFn: (payload: AddCartItemPayload) => httpCart.addCartItem(payload),
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
    onMutate: async ({ cartItemId, payload }) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });

      const previousCart = queryClient.getQueryData(cartQueryKey);

      queryClient.setQueryData<Cart>(cartQueryKey, (oldCart) => {
        if (!oldCart) return oldCart;

        const updatedMenus = oldCart.menus.map((menu) => {
          if (menu.id === cartItemId) {
            return { ...menu, quantity: payload.quantity };
          }
          return menu;
        });

        return { ...oldCart, menus: updatedMenus };
      });

      return { previousCart };
    },
    onError: (_e, _v, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
      invalidate();
    },
  });

  const remove = useMutation({
    mutationKey: ["cart", "remove"],
    mutationFn: (cartItemId: string) => httpCart.removeCartItem(cartItemId),
  });

  const clearCart = useMutation({
    mutationKey: ["cart", "clear"],
    mutationFn: () => httpCart.clearCart(),
  });

  return { add, update, remove, clearCart };
}

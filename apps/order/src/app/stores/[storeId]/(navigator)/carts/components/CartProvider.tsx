"use client";

import { createContext, useContext } from "react";
import useSuspenseWithSession from "@spaceorder/api/hooks/useSuspenseWithSession";
import { CreateOrderRequest, useCartMutations } from "@spaceorder/api/core";
import type { Cart, PublicCartItem } from "@spaceorder/db/types/cart.type";
import useOrderByCustomer from "@spaceorder/api/core/order/order/useOrderByCustomer.mutate";
import { PublicOrderWithItem } from "@spaceorder/db/types/publicModel.type";
import { UseMutationResult } from "@tanstack/react-query";
import { toast, toastByLevel } from "@spaceorder/ui/components/sonner";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";

type CartState = {
  menus: PublicCartItem[];
  createOrderMutate: UseMutationResult<
    PublicOrderWithItem,
    Error,
    CreateOrderRequest,
    unknown
  >;
};

type CartActions = {
  changeQuantity: (cartItemId: string, newQuantity: number) => Promise<void>;
  removeMenu: (menuId: string) => Promise<void>;
  createOrderRequest: () => Promise<void>;
};

type CartMeta = {
  totalPrice: number;
};

type CartContextValue = {
  state: CartState;
  actions: CartActions;
  meta: CartMeta;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { storeId } = useParams<{ storeId: string }>();
  const router = useRouter();
  const { data: cart } = useSuspenseWithSession<Cart>(
    "/carts/v1/sessions/carts"
  );

  const cartMutate = useCartMutations();
  const createOrderMutate = useOrderByCustomer().createOrderByCustomer;

  const changeQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      const { notice } = await cartMutate.update.mutateAsync({
        cartItemId,
        payload: { quantity: newQuantity },
      });
      if (notice) {
        toastByLevel(notice.level, notice.message.customer);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        toast.error("수량 변경에 실패했습니다.");
      }
    }
  };

  const createOrderRequest = async () => {
    const payload: CreateOrderRequest = {
      orderItems: cart.menus.map((menu) => ({
        menuPublicId: menu.menuPublicId,
        quantity: menu.quantity,
        menuName: menu.menuName,
        ...(menu.requiredOptions
          ? { requiredOptions: menu.requiredOptions }
          : undefined),
        ...(menu.customOptions
          ? { customOptions: menu.customOptions }
          : undefined),
      })),
    };

    try {
      await createOrderMutate.mutateAsync(payload);
      toast.success("주문이 완료되었습니다 🎉");
      router.push(`/stores/${storeId}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("주문 생성에 실패했습니다.");
      throw error;
    }
  };

  const totalPrice = cart.menus.reduce((acc, menu) => {
    const quantity = menu.quantity;
    return acc + menu.unitPrice * quantity;
  }, 0);

  const removeMenu = async (menuId: string) => {
    try {
      await cartMutate.remove.mutateAsync(menuId);
    } catch (error: unknown) {
      let errorMessage = "메뉴 삭제에 실패했습니다.";
      if (error instanceof AxiosError && error.response?.status === 404) {
        errorMessage = "해당 메뉴를 찾을 수 없습니다.";
      }
      toast.error(errorMessage);
    }
  };

  return (
    <CartContext.Provider
      value={{
        state: {
          menus: cart.menus,
          createOrderMutate,
        },
        actions: {
          changeQuantity,
          removeMenu,
          createOrderRequest,
        },
        meta: { totalPrice },
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

import { useMutation } from "@tanstack/react-query";
import { CreateOrderRequest, httpOrder } from "./httpOrder";
import { useCartMutations } from "../../cart";

export default function useOrderByCustomer() {
  const cartMutate = useCartMutations();

  const createOrderByCustomer = useMutation({
    mutationKey: ["owner", "order", "create"],
    mutationFn: (createOrderPayload: CreateOrderRequest) =>
      httpOrder.createOrderByCustomer(createOrderPayload),
    onSuccess: async () => {
      await cartMutate.clearCart.mutateAsync();
    },
  });

  return { createOrderByCustomer };
}

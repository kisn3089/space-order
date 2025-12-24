"use client";

import { useTableOrderContext } from "../store/useTableOrderContext";

export default function useUpdateTableOrder() {
  const [tableOrderState, setTableOrderState] = useTableOrderContext();

  // 수량 변경 핸들러
  const update = (selectedOrderId: string, delta: number) => {
    setTableOrderState((prevTableOrder) => {
      const updatedOrderItems = prevTableOrder.orderItem.map((orderItem) => {
        if (orderItem.id === selectedOrderId) {
          const newQuantity = Math.max(1, orderItem.quantity + delta); // 최소 1개
          return { ...orderItem, quantity: newQuantity };
        }
        return orderItem;
      });
      return { ...prevTableOrder, orderItem: updatedOrderItems };
    });
  };

  // 메뉴 삭제 핸들러
  const removeById = (selectedOrderId: string) => {
    setTableOrderState((prevOrderItems) => {
      const updatedOrderItems = prevOrderItems.orderItem.filter(
        (orderItem) => orderItem.id !== selectedOrderId
      );
      return { ...prevOrderItems, orderItem: updatedOrderItems };
    });
  };

  return { tableOrderState, update, removeById };
}

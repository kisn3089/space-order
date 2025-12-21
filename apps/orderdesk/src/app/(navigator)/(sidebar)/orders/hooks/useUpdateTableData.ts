"use client";

import { useState } from "react";
import { orderData, OrderItem } from "../components/table-orders/orderData";

const initialData = orderData[0];

export default function useUpdateTableData() {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(
    initialData.orderItem
  );

  // 수량 변경 핸들러
  const update = (selectedOrderId: string, delta: number) => {
    setOrderItems((prevOrderItems) =>
      prevOrderItems.map((prevOrder) => {
        if (prevOrder.id === selectedOrderId) {
          const newQuantity = Math.max(1, prevOrder.quantity + delta); // 최소 1개
          return { ...prevOrder, quantity: newQuantity };
        }
        return prevOrder;
      })
    );
  };

  // 메뉴 삭제 핸들러
  const remove = (selectedOrderId: string) => {
    setOrderItems((prevOrderItems) =>
      prevOrderItems.filter((item) => item.id !== selectedOrderId)
    );
  };

  return { orderItems, update, remove };
}

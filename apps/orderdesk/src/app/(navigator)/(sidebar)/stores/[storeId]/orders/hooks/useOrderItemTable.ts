"use client";

import { ResponseOrderItem } from "@spaceorder/db/types/responseModel.type";

export default function useOrderItemTable() {
  // 수량 변경 핸들러
  const update = async (orderItem: ResponseOrderItem | null) => {
    if (!orderItem) return;

    console.log("[Update] Quantity: ", orderItem);

    // setTableOrderState((prevTableOrder) => {
    //   const updatedOrderItems = prevTableOrder.orderItems.map((orderItem) => {
    //     if (orderItem.id === selectedOrderId) {
    //       const newQuantity = Math.max(1, orderItem.quantity + delta); // 최소 1개
    //       return { ...orderItem, quantity: newQuantity };
    //     }
    //     return orderItem;
    //   });
    //   return { ...prevTableOrder, orderItem: updatedOrderItems };
    // });
  };

  // 메뉴 삭제 핸들러
  const removeById = (selectedOrderId: string) => {
    console.log("[Remove] Id: ", selectedOrderId);
    // setTableOrderState((prevOrderItems) => {
    //   const updatedOrderItems = prevOrderItems.orderItem.filter(
    //     (orderItem) => orderItem.id !== selectedOrderId
    //   );
    //   return { ...prevOrderItems, orderItem: updatedOrderItems };
    // });
  };

  return { update, removeById };
}

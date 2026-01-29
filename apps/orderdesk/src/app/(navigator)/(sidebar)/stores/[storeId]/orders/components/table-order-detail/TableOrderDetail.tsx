"use client";

import { OrderDetail } from "./order-detail";

export default function TableOrderDetail({
  params,
}: {
  params: { storeId: string; tableId: string };
}) {
  return (
    <OrderDetail.Provider params={params}>
      <OrderDetail.Content>
        <OrderDetail.Table />
        <OrderDetail.Footer>
          <OrderDetail.Controlbar />
          <OrderDetail.PaymentButton />
        </OrderDetail.Footer>
      </OrderDetail.Content>
    </OrderDetail.Provider>
  );
}

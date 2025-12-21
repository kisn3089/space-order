"use client";

import { useMemo } from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@spaceorder/ui/components/button";
import useUpdateTableData from "../../hooks/useUpdateTableData";
import { transCurrencyFormat } from "@spaceorder/api";
import { AlertDialogDemo } from "../payment-dialog/PaymentDialog";

export default function TableOrderDetail() {
  const { orderItems, remove, update } = useUpdateTableData();

  // 총 가격 계산
  const totalPrice = useMemo(() => {
    return orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }, [orderItems]);

  const payment = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("결제할 데이터: ", orderItems);
  };

  return (
    <div className="overflow-hidden rounded-md border w-full h-full flex flex-col justify-between shadow-sm">
      <DataTable
        columns={columns}
        data={orderItems}
        onUpdateQuantity={update}
        onDeleteItem={remove}
      />
      <footer className="flex flex-col gap-2 p-2">
        <Button
          className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider"
          variant={"secondary"}
        >
          할인
        </Button>
        <AlertDialogDemo>
          <Button
            onClick={payment}
            className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider"
          >{`${transCurrencyFormat(totalPrice)}원 결제`}</Button>
        </AlertDialogDemo>
      </footer>
    </div>
  );
}

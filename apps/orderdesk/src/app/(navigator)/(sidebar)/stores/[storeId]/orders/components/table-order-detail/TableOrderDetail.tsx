"use client";

import { SetStateAction, useMemo } from "react";
import { Button } from "@spaceorder/ui/components/button";
import { sumFromObjects, transCurrencyFormat } from "@spaceorder/api";
import { AlertDialogWrapper } from "@spaceorder/ui/components/alert-dialog/AlertDialogWrapper";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import {
  ResponseOrderWithItem,
  TABLE_QUERY_FILTER_CONST,
  TABLE_QUERY_INCLUDE_CONST,
} from "@spaceorder/db";
import PaymentDialog from "./PaymentDialog";
import { OrderTable } from "./OrderTable";
import { columns } from "./columns";
import PaymentControlbar from "./PaymentControlbar";
import useQueryWithAuth from "@spaceorder/api/hooks/useQueryWithAuth";

const { ALIVE_SESSION } = TABLE_QUERY_FILTER_CONST;
const { ORDER_ITEMS } = TABLE_QUERY_INCLUDE_CONST;

export default function TableOrderDetail({
  params,
}: {
  params?: { storeId: string; tableId: string };
}) {
  if (!params) {
    return (
      <OrderDetail
        payment={
          <Button
            disabled
            className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider"
          >
            결제
          </Button>
        }
      >
        <div>임시</div>
      </OrderDetail>
    );
  }

  const { storeId, tableId } = params;
  const { data: orderWithItems, isSuccess } =
    useQueryWithAuth<ResponseOrderWithItem>(
      `/owner/stores/${storeId}/tables/${tableId}/orders`
      // `/owner/stores/${"ytwmuk763jytydobq32yq06e"}/tables/${"oa5zcc6kl8du8g9z7zvqjrkg"}/orders/rcxr6cxbt2x3imusm04adf84`
    );

  if (!isSuccess) {
    return <div>failed...</div>;
  }

  console.log("orderWithItems: ", orderWithItems);

  //   const {
  //     tableOrderState: orderItems,
  //     removeById,
  //     update,
  //   } = useUpdateTableOrder();

  //   총 가격 계산
  //   const totalPrice = useMemo(() => {
  //     return sumFromObjects(
  //       orderItems.orderItem,
  //       (item) => item.price * item.quantity
  //     );
  //   }, [orderItems]);

  //   const transformedTotalPrice = transCurrencyFormat(totalPrice);

  return (
    <OrderDetail
      payment={
        <AlertDialogWrapper
          title="결제 처리 하시겠습니까?"
          description="해당 테이블의 주문 내역이 초기화됩니다."
          renderFooter={PaymentDialog}
        >
          <Button className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider">{`${2}원 결제`}</Button>
          {/* <Button className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider">{`${transformedTotalPrice}원 결제`}</Button> */}
        </AlertDialogWrapper>
      }
    >
      <div />
      {/* <OrderTable
        columns={columns}
        data={orderWithItems.orderItems}
        // onUpdateQuantity={update}
        // onRemoveItem={removeById}
      /> */}
    </OrderDetail>
  );
}

type OrderDetailProps = {
  children: React.ReactNode;
  payment: React.ReactNode;
};
function OrderDetail({ children, payment }: OrderDetailProps) {
  return (
    <>
      {children}
      <footer className="flex flex-col gap-2 p-2">
        <PaymentControlbar>{payment}</PaymentControlbar>
      </footer>
    </>
  );
}

"use client";

import { Button } from "@spaceorder/ui/components/button";
import { transCurrencyFormat } from "@spaceorder/api";
import { AlertDialogWrapper } from "@spaceorder/ui/components/alert-dialog/AlertDialogWrapper";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import {
  ResponseTableWithSessions,
  TABLE_QUERY_FILTER_CONST,
  TABLE_QUERY_INCLUDE_CONST,
} from "@spaceorder/db";
import PaymentDialog from "./PaymentDialog";
import { OrderTable } from "./OrderTable";
import { columns } from "./columns";
import TableOrderDetailLayout from "./TableOrderDetailLayout";
import EmptyOrderDetail from "./EmptyOrderDetail";
import useUpdateTableOrder from "../../hooks/useUpdateTableOrder";

const { ALIVE_SESSION } = TABLE_QUERY_FILTER_CONST;
const { ORDER_ITEMS } = TABLE_QUERY_INCLUDE_CONST;

export default function TableOrderDetail({
  params,
}: {
  params: { storeId: string; tableId: string };
}) {
  const { storeId, tableId } = params;
  const { data: tableWithSessions } =
    useSuspenseWithAuth<ResponseTableWithSessions>(
      `/stores/${storeId}/tables/${tableId}?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`
    );

  const { tableSessions } = tableWithSessions;
  const tableSession = tableSessions ? tableSessions[0] : null;

  const { removeById, update } = useUpdateTableOrder();
  if (!tableSession || tableSession.orders.length === 0) {
    return <EmptyOrderDetail />;
  }

  const { orders, totalAmount } = tableSession;

  const mergedCalcuratedPriceByQuntity = orders.flatMap((order) => {
    const itemPriceByQuantity = order.orderItems.map((item) => ({
      ...item,
      totalPrice: item.price * item.quantity,
    }));
    return itemPriceByQuantity;
  });

  return (
    <TableOrderDetailLayout
      renderPayment={
        <AlertDialogWrapper
          title="결제 처리 하시겠습니까?"
          description="해당 테이블의 주문 내역이 초기화됩니다."
          renderFooter={(setOpen) =>
            PaymentDialog(setOpen, transCurrencyFormat(totalAmount))
          }
        >
          <Button className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider">{`${transCurrencyFormat(totalAmount)}원 결제`}</Button>
        </AlertDialogWrapper>
      }
    >
      <div />
      <OrderTable
        columns={columns}
        data={mergedCalcuratedPriceByQuntity}
        onUpdateQuantity={update}
        onRemoveItem={removeById}
      />
    </TableOrderDetailLayout>
  );
}

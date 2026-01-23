"use client";

import { Button } from "@spaceorder/ui/components/button";
import { sumFromObjects, transCurrencyFormat } from "@spaceorder/api";
import { AlertDialogWrapper } from "@spaceorder/ui/components/alert-dialog/AlertDialogWrapper";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import {
  ALIVE_SESSION,
  ORDER_ITEMS,
  ResponseTableWithSessions,
} from "@spaceorder/db";
import PaymentDialog from "./PaymentDialog";
import { OrderTable } from "./OrderTable";
import { columns } from "./columns";
import TableOrderDetailLayout from "./TableOrderDetailLayout";
import EmptyOrderDetail from "./EmptyOrderDetail";
import useUpdateTableOrder from "../../hooks/useUpdateTableOrder";

export default function TableOrderDetail({
  params,
}: {
  params: { storeId: string; tableId: string };
}) {
  const { storeId, tableId } = params;
  const fetchUrl = `/stores/${storeId}/tables/${tableId}?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`;

  const { data: tableWithSessions, isRefetching } =
    useSuspenseWithAuth<ResponseTableWithSessions>(fetchUrl, {
      queryOptions: { queryKey: [fetchUrl], refetchOnMount: "always" },
    });

  const { removeById, update } = useUpdateTableOrder();

  const { tableSessions } = tableWithSessions;
  const tableSession = tableSessions ? tableSessions[0] : null;
  if (!tableSession || tableSession.orders.length === 0) {
    return <EmptyOrderDetail />;
  }

  const { orders } = tableSession;
  const mergedCalcuratedPriceByQuntity = orders.flatMap((order) => {
    return order.orderItems.map((item) => ({
      ...item,
      totalPrice: item.price * item.quantity,
    }));
  });

  const totalPrice = sumFromObjects(
    mergedCalcuratedPriceByQuntity,
    (orderItem) => orderItem.totalPrice
  );

  return (
    <TableOrderDetailLayout
      renderPayment={
        <AlertDialogWrapper
          title="결제 처리 하시겠습니까?"
          description="해당 테이블의 주문 내역이 초기화됩니다."
          renderFooter={(setOpen) =>
            PaymentDialog(setOpen, transCurrencyFormat(totalPrice))
          }
        >
          <Button className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider">{`${transCurrencyFormat(totalPrice)}원 결제`}</Button>
        </AlertDialogWrapper>
      }
    >
      <OrderTable
        columns={columns}
        data={mergedCalcuratedPriceByQuntity}
        isLoading={isRefetching}
        onUpdateQuantity={update}
        onRemoveItem={removeById}
      />
    </TableOrderDetailLayout>
  );
}

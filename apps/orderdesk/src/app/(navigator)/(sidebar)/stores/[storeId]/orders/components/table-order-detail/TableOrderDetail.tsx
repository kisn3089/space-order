"use client";

import { Button } from "@spaceorder/ui/components/button";
import { sumFromObjects, transCurrencyFormat } from "@spaceorder/api";
import { AlertDialogWrapper } from "@spaceorder/ui/components/alert-dialog/AlertDialogWrapper";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";

import PaymentDialog from "./PaymentDialog";
import {
  OrderTable,
  ResponseOrderItemWithOrderIdAndPrice,
} from "./order-table/OrderTable";
import { columns } from "./columns";
import TableOrderDetailLayout from "./TableOrderDetailLayout";
import EmptyOrderDetail from "./EmptyOrderDetail";
import {
  ALIVE_SESSION,
  ORDER_ITEMS,
} from "@spaceorder/db/constants/model-query-key/sessionQueryKey.const";
import { ResponseTableWithSessions } from "@spaceorder/db/types/responseModel.type";

export default function TableOrderDetail({
  params,
}: {
  params: { storeId: string; tableId: string };
}) {
  const { storeId, tableId } = params;
  const fetchUrl = `/stores/${storeId}/tables/${tableId}?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`;

  const { data: tableWithSessions, isRefetching } =
    useSuspenseWithAuth<ResponseTableWithSessions>(fetchUrl, {
      queryOptions: { queryKey: [fetchUrl] },
    });

  const { tableSessions } = tableWithSessions;
  const tableSession = tableSessions ? tableSessions[0] : null;
  if (!tableSession || tableSession.orders.length === 0) {
    return <EmptyOrderDetail />;
  }

  const { orders } = tableSession;
  const orderItemsWithTotalPrice: ResponseOrderItemWithOrderIdAndPrice[] =
    orders.flatMap((order) =>
      order.orderItems.map((item) => {
        return {
          ...item,
          totalPrice: item.price * item.quantity,
          orderId: order.publicId,
        };
      })
    );

  const totalPrice = sumFromObjects(
    orderItemsWithTotalPrice,
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
        data={orderItemsWithTotalPrice}
        isLoading={isRefetching}
      />
    </TableOrderDetailLayout>
  );
}

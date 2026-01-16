"use client";

import { useMemo } from "react";
import { OrderTable } from "./OrderTable";
import { columns } from "./columns";
import { Button } from "@spaceorder/ui/components/button";
import useUpdateTableOrder from "../../hooks/useUpdateTableOrder";
import { HealthCheckResponse, httpMe } from "@spaceorder/api";
import { AlertDialogWrapper } from "@spaceorder/ui/components/alert-dialog/AlertDialogWrapper";
import { useCancellableAsync } from "@spaceorder/api/hooks/useCancellableAsync";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@spaceorder/ui/components/alert-dialog/alert-dialog";
import { Spinner } from "@spaceorder/ui/components/spinner";
import { sumFromObjects, transCurrencyFormat } from "@spaceorder/api";

export default function TableOrderDetail() {
  const {
    tableOrderState: orderItems,
    removeById,
    update,
  } = useUpdateTableOrder();

  // 총 가격 계산
  const totalPrice = useMemo(() => {
    return sumFromObjects(
      orderItems.orderItem,
      (item) => item.price * item.quantity
    );
  }, [orderItems]);

  const transformedTotalPrice = transCurrencyFormat(totalPrice);

  const payment = async (
    signal: AbortSignal,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    // AlertDialog 닫힘 방지
    e.preventDefault();
    const result: HealthCheckResponse = await httpMe.fetchHealthCheck({
      signal,
    });
    return result;
  };

  const paymentTransaction = useCancellableAsync<
    [React.MouseEvent<HTMLButtonElement>],
    HealthCheckResponse
  >(payment);

  return (
    <div className="overflow-hidden rounded-md border w-full h-full flex flex-col justify-between shadow-sm">
      <OrderTable
        columns={columns}
        data={orderItems.orderItem}
        onUpdateQuantity={update}
        onRemoveItem={removeById}
      />
      <footer className="flex flex-col gap-2 p-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider"
            variant={"secondary"}
          >
            할인
          </Button>
          <Button className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider">
            메뉴 추가
          </Button>
        </div>
        <AlertDialogWrapper
          title="결제 처리 하시겠습니까?"
          description="해당 테이블의 주문 내역이 초기화됩니다."
          renderFooter={(setOpen) => (
            <>
              <AlertDialogCancel onClick={paymentTransaction.abort}>
                취소
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={async (e) => {
                  await paymentTransaction(e);
                  setOpen(false);
                }}
                disabled={paymentTransaction.isPending}
              >
                {paymentTransaction.isPending ? (
                  <>
                    <Spinner />
                    {"결제 처리 중..."}
                  </>
                ) : (
                  `${transformedTotalPrice}원 결제`
                )}
              </AlertDialogAction>
            </>
          )}
        >
          <Button className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider">{`${transformedTotalPrice}원 결제`}</Button>
        </AlertDialogWrapper>
      </footer>
    </div>
  );
}

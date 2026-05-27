"use client";

import { Button } from "@spaceorder/ui/components/button";
import { transCurrencyFormat } from "@spaceorder/api";
import { AlertDialogWrapper } from "@spaceorder/ui/components/alert-dialog/AlertDialogWrapper";
import { useOrderDetailContext } from "./OrderDetailContext";
import PaymentDialogControlbar from "./PaymentDialogControlbar";

export function OrderDetailPayment() {
  const {
    state: { totalPrice },
  } = useOrderDetailContext();
  const formattedPrice = transCurrencyFormat(totalPrice);

  return (
    <AlertDialogWrapper
      title="결제 처리 하시겠습니까?"
      description="해당 테이블의 주문 내역이 초기화됩니다."
      renderFooter={(setOpen) => (
        <PaymentDialogControlbar setOpen={setOpen}>
          {`${formattedPrice}원 결제`}
        </PaymentDialogControlbar>
      )}
    >
      <Button className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider">
        {`${formattedPrice}원 결제`}
      </Button>
    </AlertDialogWrapper>
  );
}

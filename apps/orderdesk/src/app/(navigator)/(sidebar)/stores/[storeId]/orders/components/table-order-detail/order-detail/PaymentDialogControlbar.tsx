import { HealthCheckResponse, httpMe } from "@spaceorder/api/core/me/httpMe";
import { useCancelableAsync } from "@spaceorder/api/hooks/useCancelableAsync";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@spaceorder/ui/components/alert-dialog/alert-dialog";
import { Spinner } from "@spaceorder/ui/components/spinner";
import { SetStateAction } from "react";

interface PaymentDialogControlbarProps {
  children: React.ReactNode;
  setOpen: (value: SetStateAction<boolean>) => void;
}

export default function PaymentDialogControlbar({
  children,
  setOpen,
}: PaymentDialogControlbarProps) {
  const payment = async (
    signal: AbortSignal,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    const result: HealthCheckResponse = await httpMe.fetchHealthCheck({
      signal,
    });
    return result;
  };

  const paymentTransaction = useCancelableAsync<
    [React.MouseEvent<HTMLButtonElement>],
    HealthCheckResponse
  >(payment);

  const tryPayment = async (e: React.MouseEvent<HTMLButtonElement>) => {
    await paymentTransaction(e);
    setOpen(false);
  };

  return (
    <>
      <AlertDialogCancel onClick={paymentTransaction.abort}>
        취소
      </AlertDialogCancel>
      <AlertDialogAction
        onClick={tryPayment}
        disabled={paymentTransaction.isPending}
      >
        <ActivityRender
          mode={paymentTransaction.isPending ? "hidden" : "visible"}
          fallback={<LoadingTransaction />}
        >
          {children}
        </ActivityRender>
      </AlertDialogAction>
    </>
  );
}

function LoadingTransaction() {
  return (
    <>
      <Spinner />
      {"결제 처리 중..."}
    </>
  );
}

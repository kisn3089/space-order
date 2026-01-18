import {
  HealthCheckResponse,
  httpMe,
  useCancellableAsync,
} from "@spaceorder/api";
import {
  AlertDialogAction,
  AlertDialogCancel,
} from "@spaceorder/ui/components/alert-dialog/alert-dialog";
import { Spinner } from "@spaceorder/ui/components/spinner";
import { SetStateAction } from "react";

export default function PaymentDialog(
  setOpen: (value: SetStateAction<boolean>) => void
) {
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
          `${"q"}원 결제`
          // `${transformedTotalPrice}원 결제`
        )}
      </AlertDialogAction>
    </>
  );
}

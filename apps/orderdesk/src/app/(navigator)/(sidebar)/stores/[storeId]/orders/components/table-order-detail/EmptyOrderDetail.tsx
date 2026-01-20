import { Button } from "@spaceorder/ui/components/button";
import TableOrderDetailLayout from "./TableOrderDetailLayout";

export default function EmptyOrderDetail() {
  return (
    <TableOrderDetailLayout
      renderPayment={
        <Button
          disabled
          className="h-[clamp(4rem,6vw,6rem)] font-bold text-xl tracking-wider"
        >
          결제
        </Button>
      }
    >
      <EmptyOrder />
    </TableOrderDetailLayout>
  );
}

function EmptyOrder() {
  return (
    <div className="grid place-content-center h-full">
      <div className="font-semibold text-lg">선택된 테이블이 없습니다.</div>
    </div>
  );
}

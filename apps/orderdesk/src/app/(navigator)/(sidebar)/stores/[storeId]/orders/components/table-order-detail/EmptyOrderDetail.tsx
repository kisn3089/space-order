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
      <div>임시</div>
    </TableOrderDetailLayout>
  );
}

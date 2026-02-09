import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import { Button } from "@spaceorder/ui/components/button";
import { TableCell } from "@spaceorder/ui/components/table";
import { tableOrderColumns } from "../../tableOrderColumns";
import { useOrderDetailContext } from "../OrderDetailContext";
import { OrderItemWithSummarizedOrder } from "../OrderDetailTable";
import { Row } from "@tanstack/react-table";

interface OrderTableControlbarProps {
  row: Row<OrderItemWithSummarizedOrder>;
  isSelected: boolean;
}
export function OrderTableControlbar({
  row,
  isSelected,
}: OrderTableControlbarProps) {
  const {
    state: { editingItem },
    actions: { updateOrderItem, removeOrderItem },
  } = useOrderDetailContext();

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateOrderItem();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeOrderItem();
  };

  const textBold = "font-semibold";
  return (
    <ActivityRender mode={isSelected ? "visible" : "hidden"}>
      <TableCell colSpan={tableOrderColumns.length} className="p-0">
        <div className="w-full grid grid-cols-[1fr_2fr_3fr] gap-2 p-2">
          <Button
            className={textBold}
            variant={"destructive"}
            onClick={handleRemove}
          >
            삭제
          </Button>
          <Button className={textBold} variant={"outline"} disabled>
            메뉴 변경
          </Button>
          <Button
            disabled={editingItem?.quantity === row.original.quantity}
            className={textBold}
            variant={"default"}
            onClick={handleUpdate}
          >
            적용
          </Button>
        </div>
      </TableCell>
    </ActivityRender>
  );
}

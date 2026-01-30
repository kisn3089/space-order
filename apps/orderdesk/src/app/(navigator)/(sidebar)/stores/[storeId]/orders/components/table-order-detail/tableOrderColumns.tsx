"use client";

import { Button } from "@spaceorder/ui/components/button";
import { ColumnDef } from "@tanstack/react-table";
import { OrderItemWithSummarizedOrder } from "./order-detail/OrderDetailTable";
import { transCurrencyFormat } from "@spaceorder/api/utils/priceFormatter";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";

interface TableMeta {
  isEditingFinalizedOrder: boolean;
  editingData: OrderItemWithSummarizedOrder | null;
  updateEditingQuantity: (delta: number) => void;
  resetEditing: () => void;
}

export const tableOrderColumns: ColumnDef<OrderItemWithSummarizedOrder>[] = [
  {
    accessorKey: "name",
    header: "메뉴명",
    cell: ({ row }) => {
      return <div className="flex flex-col gap-2">{row.original.menuName}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-center w-full">수량</div>,
    cell: ({ row, table }) => {
      const isSelected = row.getIsSelected();
      const meta = table.options.meta as TableMeta;
      const displayQuantity =
        isSelected && meta.editingData
          ? meta.editingData.quantity
          : row.getValue<number>("quantity");

      const decreaseQuantity = () => {
        meta.updateEditingQuantity(-1);
      };
      const increaseQuantity = () => {
        meta.updateEditingQuantity(1);
      };

      const disabledCondition = meta.isEditingFinalizedOrder;
      return (
        <div className="flex items-center justify-center gap-2 w-full">
          <ChangeQuantityButton
            disabled={disabledCondition}
            aria-label="수량 감소"
            isSelected={isSelected}
            callback={decreaseQuantity}
          >
            -
          </ChangeQuantityButton>
          <span className="tabular-nums">{displayQuantity}</span>
          <ChangeQuantityButton
            disabled={disabledCondition}
            aria-label="수량 증가"
            isSelected={isSelected}
            callback={increaseQuantity}
          >
            +
          </ChangeQuantityButton>
        </div>
      );
    },
  },
  {
    accessorKey: "totalPrice",
    header: () => <div className="text-right w-full">가격</div>,
    cell: ({ row }) => {
      const amount = parseInt(row.getValue("totalPrice"));
      const formatted = transCurrencyFormat(amount);

      return <div className="text-right w-full">{formatted}</div>;
    },
  },
];

interface ChangeQuantityButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSelected: boolean;
  callback: () => void;
}
function ChangeQuantityButton({
  isSelected,
  callback,
  ...props
}: ChangeQuantityButtonProps) {
  const { children, ...restProps } = props;
  const changeQuantity = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    callback();
  };

  return (
    <ActivityRender mode={isSelected ? "visible" : "hidden"}>
      <Button
        size="sm"
        className="size-7 font-semibold border bg-background text-accent-foreground shadow-xs hover:bg-accent"
        onClick={changeQuantity}
        {...restProps}
      >
        {children}
      </Button>
    </ActivityRender>
  );
}

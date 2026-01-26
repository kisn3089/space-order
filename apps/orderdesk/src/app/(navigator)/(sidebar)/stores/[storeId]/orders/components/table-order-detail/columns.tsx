"use client";

import { Button } from "@spaceorder/ui/components/button";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@spaceorder/ui/components/badge";
import { ResponseOrderItemWithOrderIdAndPrice } from "./order-table/OrderTable";

interface TableMeta {
  editingData: ResponseOrderItemWithOrderIdAndPrice | null;
  updateEditingQuantity: (delta: number) => void;
  resetEditing: () => void;
}

export const columns: ColumnDef<ResponseOrderItemWithOrderIdAndPrice>[] = [
  {
    accessorKey: "name",
    header: "메뉴명",
    cell: ({ row }) => {
      const orderOptions = row.original.options;

      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1 flex-wrap">
            {orderOptions && (
              <>
                {Object.entries(orderOptions).map(([key, value]) => (
                  <Badge
                    key={key}
                    /**
                     * 메뉴 옵션은 requiredOpions, customOptions로 나뉘지만, 주문 시 구분하지 않기 때문에
                     * requiredOptions, customOptions 두 가지 케이스 모두 처리할 수 있도록 함
                     */
                  >{`${key}: ${value?.options ?? value}`}</Badge>
                ))}
              </>
            )}
          </div>
          {row.original.menuName}
        </div>
      );
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

      return (
        <div className="flex items-center justify-center gap-2 w-full">
          {isSelected && (
            <Button
              size="sm"
              className="size-7 font-semibold border bg-background text-accent-foreground shadow-xs hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                meta.updateEditingQuantity(-1);
              }}
            >
              -
            </Button>
          )}
          <span>{displayQuantity}</span>
          {isSelected && (
            <Button
              size="sm"
              className="size-7 font-semibold border bg-background text-accent-foreground shadow-xs hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                meta.updateEditingQuantity(1);
              }}
            >
              +
            </Button>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "totalPrice",
    header: () => <div className="text-right w-full">가격</div>,
    cell: ({ row }) => {
      const amount = parseInt(row.getValue("totalPrice"));
      const formatted = new Intl.NumberFormat("ko-KR", {
        currency: "KRW",
      }).format(amount);

      return <div className="text-right w-full">{formatted}</div>;
    },
  },
];

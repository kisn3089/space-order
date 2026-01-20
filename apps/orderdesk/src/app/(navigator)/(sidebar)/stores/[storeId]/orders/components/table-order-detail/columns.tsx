"use client";

import { Button } from "@spaceorder/ui/components/button";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@spaceorder/ui/components/badge";
import { ResponseOrderItem } from "@spaceorder/db";

export const columns: ColumnDef<ResponseOrderItem>[] = [
  {
    accessorKey: "name",
    header: "메뉴명",
    cell: ({ row }) => {
      // 필수 옵션과 추가 옵션을 합쳐서 표시
      const orderOptions = row.original.options;

      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1 flex-wrap">
              {orderOptions && (
                <>
                  {Object.entries(orderOptions).map(([key, value]) => (
                    <Badge key={key}>{`${key}: ${value}`}</Badge>
                  ))}
                </>
              )}
            </div>
            {row.original.menuName}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-center w-full">수량</div>,
    cell: ({ row, table }) => {
      const isSelected = row.getIsSelected();
      const meta = table.options.meta as {
        onUpdateQuantity?: (itemId: string, delta: number) => void;
      };

      return (
        <div className="flex items-center justify-center gap-2 w-full">
          {isSelected && (
            <Button
              variant="outline"
              size="sm"
              className="size-7 font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                meta?.onUpdateQuantity?.(row.original.publicId, -1);
              }}
            >
              -
            </Button>
          )}
          <span>{row.getValue("quantity")}</span>
          {isSelected && (
            <Button
              variant="outline"
              size="sm"
              className="size-7 font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                meta?.onUpdateQuantity?.(row.original.publicId, 1);
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
    cell: ({ row, table }) => {
      const amount = parseFloat(row.getValue("totalPrice"));
      const formatted = new Intl.NumberFormat("ko-KR", {
        currency: "KRW",
      }).format(amount);

      const isSelected = row.getIsSelected();
      const meta = table.options.meta as {
        onRemoveItem?: {
          remove: (itemId: string) => void;
        };
        setSelectedRow: (selection: Record<string, boolean>) => void;
      };

      const removeMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        meta?.onRemoveItem?.remove?.(row.original.publicId);
        // 삭제 후 선택 상태 초기화
        meta?.setSelectedRow({});
      };

      return (
        <div className="text-right w-full">
          {formatted}
          {isSelected && (
            <Button
              onClick={removeMenu}
              className="h-8"
              variant={"destructive"}
            >
              삭제
            </Button>
          )}
        </div>
      );
    },
  },
];

"use client";

import { Button } from "@spaceorder/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@spaceorder/ui/components/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { OrderItem } from "../table-orders/TableOrder";

export const columns: ColumnDef<OrderItem>[] = [
  {
    accessorKey: "name",
    header: "메뉴명",
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-center w-full">수량</div>,
    cell: ({ row }) => {
      const isSelected = row.getIsSelected();
      return (
        <div className="flex items-center justify-center gap-2 w-full">
          {isSelected && (
            <Button
              variant="outline"
              size="sm"
              className="size-7"
              onClick={(e) => {
                e.stopPropagation();
                // 수량 감소 핸들러
                console.log("Decrease quantity:", row.original);
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
              className="size-7"
              onClick={(e) => {
                e.stopPropagation();
                // 수량 증가 핸들러
                console.log("Increase quantity:", row.original);
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
    accessorKey: "price",
    header: () => <div className="text-right w-full">가격</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
      }).format(amount);

      return <div className="text-right w-full">{formatted}</div>;
    },
  },
  //   {
  //     id: "actions",
  //     cell: ({ row }) => {
  //       const payment = row.original;

  //       return (
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button variant="ghost" className="h-8 w-8 p-0">
  //               <span className="sr-only">Open menu</span>
  //               <MoreHorizontal className="h-4 w-4" />
  //             </Button>
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuLabel>Actions</DropdownMenuLabel>
  //             <DropdownMenuItem
  //               onClick={() => navigator.clipboard.writeText(payment.id)}
  //             >
  //               Copy payment ID
  //             </DropdownMenuItem>
  //             <DropdownMenuSeparator />
  //             <DropdownMenuItem>View customer</DropdownMenuItem>
  //             <DropdownMenuItem>View payment details</DropdownMenuItem>
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       );
  //     },
  //   },
];

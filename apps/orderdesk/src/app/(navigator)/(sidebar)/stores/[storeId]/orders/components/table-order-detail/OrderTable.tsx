"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@spaceorder/ui/components/table";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import LoadingSpinner from "@/components/LoadingSpinner";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onUpdateQuantity?: (itemId: string, delta: number) => void;
  onRemoveItem?: (itemId: string) => void;
}

export function OrderTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onUpdateQuantity,
  onRemoveItem,
}: DataTableProps<TData, TValue>) {
  const [selectedRow, setSelectedRow] = useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection: selectedRow,
    },
    enableRowSelection: true,
    onRowSelectionChange: setSelectedRow,
    meta: {
      onUpdateQuantity,
      onRemoveItem: {
        remove: onRemoveItem,
      },
      setSelectedRow,
    },
  });

  const detectChanges = () => {
    const selectedRowKeys = Object.keys(selectedRow);
    if (selectedRowKeys.length === 0) return;

    setSelectedRow({});
    // TODO: 테이블 변경점 포착 시 API 호출 로직을 여기에 추가해야 함
  };

  return (
    <Table className="h-full" onClick={detectChanges}>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow
            className="grid grid-cols-[2fr_1fr_1fr]"
            key={headerGroup.id}
          >
            {headerGroup.headers.map((header) => {
              return (
                <TableHead
                  key={header.id}
                  className="flex items-center whitespace-pre"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        <ActivityRender
          mode={isLoading ? "hidden" : "visible"}
          fallback={<LoadingFallback />}
        >
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              onClick={(e: React.MouseEvent<HTMLTableRowElement>) => {
                // 상위 table 태그의 clearSelection 이벤트 방지
                e.stopPropagation();
                // 이미 선택된 row를 클릭하면 해제, 아니면 단일 선택
                if (row.getIsSelected()) {
                  row.toggleSelected(false);
                  detectChanges();
                } else {
                  table.resetRowSelection();
                  row.toggleSelected(true);
                }
              }}
              className="grid grid-cols-[2fr_1fr_1fr] cursor-pointer min-h-16 animate-fade-in-up"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="flex items-center font-semibold text-base overflow-hidden"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </ActivityRender>
      </TableBody>
    </Table>
  );
}

function LoadingFallback() {
  return (
    <tr>
      <td>
        <LoadingSpinner />
      </td>
    </tr>
  );
}

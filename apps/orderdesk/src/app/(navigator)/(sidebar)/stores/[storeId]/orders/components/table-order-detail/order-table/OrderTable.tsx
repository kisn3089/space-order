"use client";

import {
  ColumnDef,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@spaceorder/ui/components/table";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import LoadingSpinner from "@/components/LoadingSpinner";
import OrderTableHeader from "./OrderTableHeader";
import EditController from "./EditController";
import OrderTableCells from "./OrderTableCells";
import useOrderItemTable from "../../../hooks/useOrderItemTable";
import { ResponseOrderItem } from "@spaceorder/db/types/responseModel.type";

export type ResponseOrderItemWithOrderId = ResponseOrderItem & {
  orderId: string;
};
interface DataTableProps {
  columns: ColumnDef<ResponseOrderItemWithOrderId>[];
  data: ResponseOrderItemWithOrderId[];
  isLoading?: boolean;
}
/** TODO: 컴포넌트 재사용 가능성 높은니 추상화 필요 */
export function OrderTable({ columns, data, isLoading }: DataTableProps) {
  const { removeById, update } = useOrderItemTable();
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [editingData, setEditingData] =
    useState<ResponseOrderItemWithOrderId | null>(null);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    meta: {
      editingData,
      updateEditingQuantity: (delta: number) =>
        setEditingData((prev) =>
          prev
            ? { ...prev, quantity: Math.max(1, prev.quantity + delta) }
            : null
        ),
      resetEditing: () => setEditingData(null),
    },
  });

  const clearSelection = () => {
    const selectedRowKeys = Object.keys(rowSelection);
    if (selectedRowKeys.length === 0) return;

    setRowSelection({});
    setEditingData(null);
  };

  const RowClickEvent = (
    e: React.MouseEvent<HTMLTableRowElement>,
    row: Row<ResponseOrderItemWithOrderId>
  ) => {
    const isSelected = row.getIsSelected();
    e.stopPropagation();
    if (isSelected) {
      row.toggleSelected(false);
      clearSelection();
    } else {
      table.resetRowSelection();
      row.toggleSelected(true);

      setEditingData(row.original);
    }
  };

  const resetSelection = () => {
    setRowSelection({});
    setEditingData(null);
  };

  const removeMenu = () => {
    removeById(editingData);
    resetSelection();
  };

  const updateFromEditingItem = () => {
    update(editingData);
    resetSelection();
  };

  return (
    <Table className="h-full" onClick={clearSelection}>
      <OrderTableHeader table={table} />
      <TableBody>
        <ActivityRender
          mode={isLoading ? "hidden" : "visible"}
          fallback={<LoadingFallback columns={columns} />}
        >
          {table.getRowModel().rows.map((row) => {
            const isSelected = row.getIsSelected();

            return (
              <TableRow
                key={row.id}
                data-state={isSelected && "selected"}
                onClick={(e) => RowClickEvent(e, row)}
                className="flex flex-col"
              >
                <OrderTableCells row={row} />
                <ActivityRender mode={isSelected ? "visible" : "hidden"}>
                  <EditController
                    setChanges={(e) => {
                      e.stopPropagation();
                      updateFromEditingItem();
                    }}
                    remove={(e) => {
                      e.stopPropagation();
                      removeMenu();
                    }}
                  />
                </ActivityRender>
              </TableRow>
            );
          })}
        </ActivityRender>
      </TableBody>
    </Table>
  );
}

function LoadingFallback<Data>({ columns }: { columns: ColumnDef<Data>[] }) {
  return (
    <TableRow>
      <TableCell colSpan={columns.length}>
        <LoadingSpinner />
      </TableCell>
    </TableRow>
  );
}

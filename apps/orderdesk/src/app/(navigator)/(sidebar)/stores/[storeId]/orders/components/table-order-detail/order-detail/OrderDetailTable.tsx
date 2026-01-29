"use client";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { tableOrderColumns } from "../tableOrderColumns";
import { useOrderDetailContext } from "./OrderDetailContext";
import { OrderTable } from "./order-table";
import { ResponseOrderItem } from "@spaceorder/db/types/responseModel.type";
import { OrderStatus } from "@spaceorder/db/index";

export type OrderItemWithSummarizedOrder = ResponseOrderItem & {
  totalPrice: number;
  orderId: string;
  orderStatus: OrderStatus;
};
export function OrderDetailTable() {
  const {
    state: {
      orderItems,
      editingItem,
      rowSelection,
      isCompletedEditingOrderStatus,
    },
    actions: { setRowSelection, updateEditingQuantity, resetSelection },
  } = useOrderDetailContext();

  const tableMeta = {
    isCompletedEditingOrderStatus,
    editingData: editingItem,
    updateEditingQuantity,
    resetEditing: resetSelection,
  };

  const table = useReactTable({
    data: orderItems,
    columns: tableOrderColumns,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    meta: tableMeta,
  });

  return (
    <OrderTable.Frame>
      <OrderTable.Header table={table} />
      <OrderTable.Body>
        {table.getRowModel().rows.map((row) => {
          const isSelected = row.getIsSelected();

          return (
            <OrderTable.Row key={row.id} row={row} table={table}>
              <OrderTable.Options
                optionsSnapshot={row.original.optionsSnapshot}
                isSelected={isSelected}
              />
              <OrderTable.Item row={row} />
              <OrderTable.Controlbar isSelected={isSelected} />
            </OrderTable.Row>
          );
        })}
      </OrderTable.Body>
    </OrderTable.Frame>
  );
}

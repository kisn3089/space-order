import { TableRow } from "@spaceorder/ui/components/table";
import { useOrderDetailContext } from "../OrderDetailContext";
import { OrderItemWithSummarizedOrder } from "../OrderDetailTable";
import { Row, Table } from "@tanstack/react-table";

interface OrderTableRowProps {
  children: React.ReactNode;
  table: Table<OrderItemWithSummarizedOrder>;
  row: Row<OrderItemWithSummarizedOrder>;
}
export function OrderTableRow({ children, row, table }: OrderTableRowProps) {
  const {
    state: { isCompletedEditingOrderStatus },
    actions: { resetSelection, setEditingItem },
  } = useOrderDetailContext();

  const isSelected = row.getIsSelected();

  const handleRowClick = (
    e:
      | React.MouseEvent<HTMLTableRowElement>
      | React.KeyboardEvent<HTMLTableRowElement>
  ) => {
    e.stopPropagation();

    if (isSelected) {
      row.toggleSelected(false);
      resetSelection();
    } else {
      table.resetRowSelection();
      row.toggleSelected(true);
      setEditingItem(row.original);
    }
  };

  const IgnoreTabKey = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Tab") {
      return;
    }
    handleRowClick(e);
  };

  return (
    <TableRow
      role="button"
      tabIndex={isSelected ? -1 : 0}
      onKeyDown={
        isSelected && !isCompletedEditingOrderStatus ? undefined : IgnoreTabKey
      }
      onClick={handleRowClick}
      data-state={isSelected && "selected"}
      className="flex flex-col"
    >
      {children}
    </TableRow>
  );
}

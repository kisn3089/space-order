import { TableRow } from "@spaceorder/ui/components/table";
import { useOrderDetailContext } from "../OrderDetailContext";
import { OrderItemWithSummarizedOrder } from "../OrderDetailTable";
import { Row, Table } from "@tanstack/react-table";
import { OrderStatus } from "@spaceorder/db/index";

interface OrderTableRowProps {
  children: React.ReactNode;
  table: Table<OrderItemWithSummarizedOrder>;
  row: Row<OrderItemWithSummarizedOrder>;
}
export function OrderTableRow({ children, row, table }: OrderTableRowProps) {
  const {
    actions: { resetSelection, setEditingItem },
  } = useOrderDetailContext();

  const isSelected = row.getIsSelected();

  const isFinalizedOrder =
    row.original.orderStatus === OrderStatus.COMPLETED ||
    row.original.orderStatus === OrderStatus.CANCELLED;

  const handleRowClick = (
    e:
      | React.MouseEvent<HTMLTableRowElement>
      | React.KeyboardEvent<HTMLTableRowElement>
  ) => {
    e.stopPropagation();

    if (isFinalizedOrder) return;

    if (isSelected) {
      row.toggleSelected(false);
      resetSelection();
    } else {
      table.resetRowSelection();
      row.toggleSelected(true);
      setEditingItem(row.original);
    }
  };

  const ignoreTabKey = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Tab") {
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // Space 키의 스크롤 방지
      handleRowClick(e);
    }
  };

  const disabled = `opacity-50 pointer-events-none`;

  return (
    <TableRow
      role="button"
      tabIndex={isSelected || isFinalizedOrder ? -1 : 0}
      onKeyDown={isSelected ? undefined : ignoreTabKey}
      onClick={handleRowClick}
      data-state={isSelected && "selected"}
      className={`flex flex-col ${isFinalizedOrder ? disabled : ""}`}
    >
      {children}
    </TableRow>
  );
}

import { TableRow } from "@spaceorder/ui/components/table";
import { useOrderDetailContext } from "../OrderDetailContext";
import { OrderItemWithSummarizedOrder } from "../OrderDetailTable";
import { Row, Table } from "@tanstack/react-table";
import ButtonWrapper from "@spaceorder/ui/components/ButtonWrapper";

interface OrderTableRowProps {
  children: React.ReactNode;
  table: Table<OrderItemWithSummarizedOrder>;
  row: Row<OrderItemWithSummarizedOrder>;
}
export function OrderTableRow({ children, row, table }: OrderTableRowProps) {
  const {
    actions: { resetSelection, setEditingItem },
  } = useOrderDetailContext();

  const handleRowClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const isSelected = row.getIsSelected();
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

  const isSelected = row.getIsSelected();

  return (
    <ButtonWrapper onClick={handleRowClick}>
      <TableRow data-state={isSelected && "selected"} className="flex flex-col">
        {children}
      </TableRow>
    </ButtonWrapper>
  );
}

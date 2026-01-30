import { Table } from "@spaceorder/ui/components/table";
import { useOrderDetailContext } from "../OrderDetailContext";

interface OrderTableFrameProps {
  children: React.ReactNode;
}

export function OrderTableFrame({ children }: OrderTableFrameProps) {
  const {
    state: { editingItem },
    actions: { resetSelection },
  } = useOrderDetailContext();

  const clearSelection = () => {
    if (!editingItem) return;
    resetSelection();
  };

  return (
    <Table onClick={clearSelection} className="h-full">
      {children}
    </Table>
  );
}

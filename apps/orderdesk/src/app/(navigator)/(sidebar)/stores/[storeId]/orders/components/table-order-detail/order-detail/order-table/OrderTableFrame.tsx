import { Table } from "@spaceorder/ui/components/table";
import { useOrderDetailContext } from "../OrderDetailContext";
import ButtonWrapper from "@spaceorder/ui/components/ButtonWrapper";

interface OrderTableFrameProps {
  children: React.ReactNode;
}

export function OrderTableFrame({ children }: OrderTableFrameProps) {
  const {
    state: { rowSelection },
    actions: { resetSelection },
  } = useOrderDetailContext();

  const clearSelection = () => {
    const selectedRowKeys = Object.keys(rowSelection);
    if (selectedRowKeys.length === 0) return;
    resetSelection();
  };

  return (
    <ButtonWrapper onClick={clearSelection}>
      <Table className="h-full">{children}</Table>
    </ButtonWrapper>
  );
}

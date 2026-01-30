import {
  TableBody,
  TableCell,
  TableRow,
} from "@spaceorder/ui/components/table";
import { useOrderDetailContext } from "../OrderDetailContext";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import LoadingSpinner from "@/components/LoadingSpinner";
import { tableOrderColumns } from "../../tableOrderColumns";

interface OrderTableBodyProps {
  children: React.ReactNode;
}

export function OrderTableBody({ children }: OrderTableBodyProps) {
  const {
    meta: { isRefetching },
  } = useOrderDetailContext();

  return (
    <TableBody>
      <ActivityRender
        mode={isRefetching ? "hidden" : "visible"}
        fallback={<LoadingFallback />}
      >
        {children}
      </ActivityRender>
    </TableBody>
  );
}

function LoadingFallback() {
  return (
    <TableRow>
      <TableCell colSpan={tableOrderColumns.length}>
        <LoadingSpinner />
      </TableCell>
    </TableRow>
  );
}

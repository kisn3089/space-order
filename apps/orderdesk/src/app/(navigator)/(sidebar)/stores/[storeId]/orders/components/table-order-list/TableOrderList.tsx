import { SummarizedTableWithSessions } from "@spaceorder/db";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import TableOrder from "./TableOrder";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import SessionExpireTime from "@/app/common/orders/SessionExpireTime";
import { ErrorBoundary } from "react-error-boundary";
import { useParams, useRouter } from "next/navigation";
import ErrorFallback from "@/components/ErrorFallback";
import TableErrorFallback from "./TableErrorFallback";
import AcceptAllPendingOrders from "./AcceptAllPendingOrders";

type TableBoardProps = {
  sanitizedTable: SummarizedTableWithSessions;
};

export default function TableOrderList({ sanitizedTable }: TableBoardProps) {
  const params = useParams<{ storeId: string; tableId: string }>();
  const { tableNumber, section, tableSessions } = sanitizedTable;
  /** 서버에서 최신의 tableSession 하나를 배열 형태로 응답한다. */
  const tableSession = tableSessions ? tableSessions[0] : null;

  const { push } = useRouter();
  const tableClickEvent = () => {
    push(`/stores/${params.storeId}/orders/${sanitizedTable.publicId}`);
  };

  const isActiveTable = sanitizedTable.isActive === true;
  const tableInactivateStyle = isActiveTable
    ? ""
    : "opacity-20 cursor-not-allowed";
  const sessionActiveStyle = tableSession ? "hover:bg-accent" : "";
  const selectedTableStyle = "shadow-lg shadow-destructive/50";

  return (
    <Card
      className={`w-full min-h-[200px] flex flex-col cursor-pointer transition-shadow duration-300 ${sessionActiveStyle} ${tableInactivateStyle} ${params.tableId === sanitizedTable.publicId ? selectedTableStyle : ""} max-h-[300px]`}
      onClick={() => (isActiveTable ? tableClickEvent() : null)}
    >
      <CardHeader className="flex flex-row justify-between gap-1 p-2">
        <CardTitle>{tableNumber}</CardTitle>
        <ActivityRender mode={section ? "visible" : "hidden"}>
          <CardDescription className="text-sm">{section}</CardDescription>
        </ActivityRender>
      </CardHeader>
      <div className="h-full overflow-y-auto scrollbar-hide relative">
        <div className="px-2">
          <AcceptAllPendingOrders
            orders={tableSession?.orders}
            tableId={sanitizedTable.publicId}
          />
        </div>
        <div className="flex flex-col gap-y-1 p-2">
          <ActivityRender mode={tableSession ? "visible" : "hidden"}>
            {tableSession?.orders?.map((order) => (
              <ErrorBoundary
                fallbackRender={(args) => (
                  <ErrorFallback {...args}>
                    <TableErrorFallback />
                  </ErrorFallback>
                )}
                key={order.publicId}
              >
                <TableOrder
                  key={order.publicId}
                  order={order}
                  tableId={sanitizedTable.publicId}
                />
              </ErrorBoundary>
            ))}
          </ActivityRender>
        </div>
      </div>
      <ActivityRender mode={tableSession?.expiresAt ? "visible" : "hidden"}>
        <CardFooter className="p-2">
          <SessionExpireTime expiresAt={tableSession?.expiresAt} />
        </CardFooter>
      </ActivityRender>
    </Card>
  );
}

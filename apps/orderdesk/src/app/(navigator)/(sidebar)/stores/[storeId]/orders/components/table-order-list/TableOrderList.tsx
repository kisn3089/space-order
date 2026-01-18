import {
  OrderStatus,
  ResponseTableWithSessions,
  TABLE_QUERY_FILTER_CONST,
  TABLE_QUERY_INCLUDE_CONST,
} from "@spaceorder/db";
import { Button } from "@spaceorder/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import TableOrder from "./TableOrder";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import SessionExpireTime from "@/app/common/orders/SessionExpireTime";
import { ErrorBoundary } from "react-error-boundary";
import { useRouter } from "next/navigation";
import ErrorFallback from "@/components/ErrorFallback";

type TableBoardProps = {
  storeId: string;
  tableId: string;
};
const { ALIVE_SESSION } = TABLE_QUERY_FILTER_CONST;
const { ORDER_ITEMS } = TABLE_QUERY_INCLUDE_CONST;

export default function TableOrderList({ storeId, tableId }: TableBoardProps) {
  const { push } = useRouter();

  const { data: table } = useSuspenseWithAuth<ResponseTableWithSessions>(
    `/stores/${storeId}/tables/${tableId}?include=${ORDER_ITEMS}&filter=${ALIVE_SESSION}`
  );

  const { tableNumber, section, tableSessions } = table;
  /** 서버에서 최신의 tableSession 하나를 배열 형태로 응답한다. */
  const tableSession = tableSessions ? tableSessions[0] : null;

  const findPendingStatusInOrders = tableSession?.orders?.find(
    (order) => order.status === OrderStatus.PENDING
  );

  const acceptEveryPendingOrders = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log("모든 주문 수락했어요!");
  };

  const tableClickEvnet = () => {
    push(`/stores/${storeId}/orders/${tableId}`);
  };

  const isActiveTable = table.isActive === true;
  const selectableStyle = isActiveTable ? "" : "opacity-20 cursor-not-allowed";
  const sessionActiveStyle = tableSession ? "hover:bg-accent" : "";

  return (
    <Card
      className={`w-full min-h-[200px] flex flex-col cursor-pointer ${sessionActiveStyle} ${selectableStyle} max-h-[300px]`}
      onClick={() => (isActiveTable ? tableClickEvnet() : null)}
    >
      <CardHeader className="flex flex-row justify-between gap-1 p-2">
        <CardTitle>{tableNumber}</CardTitle>
        <ActivityRender mode={section ? "visible" : "hidden"}>
          <CardDescription className="text-sm">{section}</CardDescription>
        </ActivityRender>
      </CardHeader>
      <div className="h-full relative">
        <ActivityRender mode={findPendingStatusInOrders ? "visible" : "hidden"}>
          <div className="p-2">
            <Button onClick={acceptEveryPendingOrders} className="w-full">
              {"모든 주문 수락"}
            </Button>
          </div>
        </ActivityRender>
        <div className="flex flex-col gap-y-1 pb-2 overflow-y-auto scrollbar-hide">
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
                  tableId={table.publicId}
                  orderId={order.publicId}
                  storeId={storeId}
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

function TableErrorFallback() {
  return (
    <div className="absolute top-[50%] transform-3d -translate-y-[50%]">
      <div className="flex flex-col gap-2 p-2">
        <p className="font-semibold">주문 정보 요청 중 오류가 발생했습니다.</p>
        <Button id="retry" className="w-full">
          다시 시도
        </Button>
      </div>
    </div>
  );
}

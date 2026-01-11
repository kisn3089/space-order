import { OrderStatus, PublicTableSessionWithTable } from "@spaceorder/db";
import { Button } from "@spaceorder/ui/components/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import TableOrder from "../table-orders/TableOrder";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";

type TableBoardProps = { table: PublicTableSessionWithTable };
export default function TableBoard({ table }: TableBoardProps) {
  const { tableNumber, section, tableSessions } = table;
  /** 서버에서 최신의 tableSession 하나를 배열 형태로 응답한다. */
  /** tableSession이 없을 때 fallback jsx를 eraly return 하자 */
  const tableSession = tableSessions?.[0];

  const findPendingStatusInOrders = tableSession?.orders?.find(
    (order) => order.status === OrderStatus.PENDING
  );

  const acceptEveryPendingOrders = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log("모든 주문 수락했어요!");
  };

  const tableClickEvnet = () => {
    console.log("click order");
    // setTableOrderState(order)
  };

  const isActiveTable = table.isActive === true;
  const selectableStyle = isActiveTable ? "" : "opacity-20 cursor-not-allowed";
  const sessionActiveStyle = tableSession ? "hover:bg-accent" : "";

  const sessionExpireAt = tableSession
    ? new Date(tableSession.expiresAt).toLocaleTimeString("Ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

  return (
    <Card
      className={`w-full min-h-[200px] flex flex-col cursor-pointer ${sessionActiveStyle} ${selectableStyle} max-h-[300px]`}
      onClick={tableClickEvnet}
    >
      <CardHeader className="flex flex-row justify-between gap-1 p-2">
        <CardTitle>{tableNumber}</CardTitle>
        <ActivityRender mode={section ? "visible" : "hidden"}>
          <CardDescription className="text-sm">{section}</CardDescription>
        </ActivityRender>
      </CardHeader>
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
            <TableOrder
              key={order.publicId}
              tableId={table.publicId}
              order={order}
            />
          ))}
        </ActivityRender>
      </div>
      <ActivityRender mode={sessionExpireAt ? "visible" : "hidden"}>
        <CardFooter>
          <p>{sessionExpireAt}</p>
        </CardFooter>
      </ActivityRender>
    </Card>
  );
}

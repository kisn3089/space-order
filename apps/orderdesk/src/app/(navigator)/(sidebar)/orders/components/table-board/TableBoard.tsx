import { OrderStatus, PublicTableSessionWithTable } from "@spaceorder/db";
import { Button } from "@spaceorder/ui/components/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import TableOrder from "../table-orders/TableOrder";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";

export default function TableBoard({
  table,
}: {
  table: PublicTableSessionWithTable;
}) {
  const { tableNumber, section, tableSessions } = table;
  /** 서버에서 최신의 tableSession 하나를 배열 형태로 응답한다. */
  const tableSession = tableSessions?.[0];

  const findPendingStatusInOrders = tableSession?.orders?.find(
    (order) => order.status === OrderStatus.PENDING
  );

  const acceptOrder = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    console.log("모든 주문 수락했어요!");
  };

  const isActiveTable = table.isActive === true;
  const selectableStyle = isActiveTable ? "" : "opacity-20 cursor-not-allowed";
  const sessionActiveStyle = tableSession ? "hover:bg-accent" : "";

  return (
    <Card
      className={`w-full min-h-[200px] flex flex-col cursor-pointer ${sessionActiveStyle} ${selectableStyle} max-h-[300px]`}
      onClick={() => {
        console.log("click order");
        // setTableOrderState(order)
      }}
    >
      <CardHeader className="flex flex-row justify-between gap-1 p-2">
        <CardTitle>{tableNumber}</CardTitle>
        <ActivityRender mode={section ? "visible" : "hidden"}>
          <CardDescription className="text-sm">{section}</CardDescription>
        </ActivityRender>
      </CardHeader>
      <ActivityRender mode={findPendingStatusInOrders ? "visible" : "hidden"}>
        <div className="p-2">
          <Button onClick={acceptOrder} className="w-full">
            {"모든 주문 수락"}
          </Button>
        </div>
      </ActivityRender>
      <div className="flex flex-col gap-y-1 pb-2 overflow-y-auto scrollbar-hide">
        {tableSession &&
          tableSession.orders?.map((order) => (
            <TableOrder key={order.publicId} order={order} />
          ))}
      </div>
    </Card>
  );
}

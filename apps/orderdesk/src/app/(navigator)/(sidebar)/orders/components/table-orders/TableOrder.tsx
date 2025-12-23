import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import { TTableOrder } from "./orderData";
import { useTableOrderContext } from "../../store/useTableOrderContext";

export default function TableOrder({ order }: { order: TTableOrder }) {
  const [_, setTableOrderState] = useTableOrderContext();
  const { id, tableNum, orderItem, totalPrice, memo } = order;

  return (
    <Card
      onClick={() => setTableOrderState(order)}
      className="w-full flex flex-col cursor-pointer hover:bg-accent"
    >
      <CardHeader className="p-4">
        <CardTitle>{tableNum}</CardTitle>
        {memo && (
          <CardDescription className="whitespace-pre-line">{`요청 사항: ${memo}`}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 p-4 font-semibold flex flex-col justify-center">
        {orderItem.map((order) => (
          <p key={`${order.name}`}>{`${order.name}: ${order.quantity}개`}</p>
        ))}
      </CardContent>
      <CardFooter className="flex justify-end p-2">
        <p className="text-muted-foreground text-sm font-semibold">
          {`총 금액: ${totalPrice}원`}
        </p>
      </CardFooter>
    </Card>
  );
}

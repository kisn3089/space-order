import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import { Order } from "./orderData";

export default function TableOrder({
  tableNum,
  orderItem,
  totalPrice,
  memo,
}: Order) {
  return (
    <Card className="w-full flex flex-col cursor-pointer hover:bg-accent">
      <CardHeader className="p-4">
        <CardTitle>{tableNum}</CardTitle>
        {memo && (
          <CardDescription className="whitespace-pre">{`요청 사항: ${memo}`}</CardDescription>
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

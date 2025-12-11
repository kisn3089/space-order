import { Card, CardHeader, CardTitle } from "@spaceorder/ui/components/card";
import { UserInfo } from "../signin/components/UserInfo";

export default function OrdersPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <UserInfo />
      <Card className="w-full max-w-md min-w-sm">
        <CardHeader className="p-8">
          <CardTitle className="flex justify-center font-bold">
            ORDERS PAGE!
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

import { Card, CardTitle } from "@spaceorder/ui/components/card";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { OrderItem } from "../table-orders/TableOrder";
import { orderData } from "../table-orders/orderData";

const data: OrderItem[] = orderData[0].orderItem;

export default function TableOrderDetail() {
  return (
    <Card className="w-full h-full grid place-items-center">
      {/* <CardTitle>Detail View</CardTitle> */}
      <DataTable columns={columns} data={data} />
    </Card>
  );
}

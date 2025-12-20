import { orderData } from "./orderData";
import TableOrder from "./TableOrder";

const tableCnt = [
  { tableNum: 1 },
  { tableNum: 2 },
  { tableNum: 3 },
  { tableNum: 4 },
  { tableNum: 5 },
  { tableNum: 6 },
  { tableNum: 7 },
  { tableNum: 8 },
];

export default function TableOrders() {
  return (
    <div className="w-full h-full grid grid-cols-2 gap-3">
      {tableCnt.map((table) => {
        const order = orderData.find(
          (order) => order.tableNum === table.tableNum
        ) || {
          id: table.tableNum,
          tableNum: table.tableNum,
          totalPrice: 0,
          orderItem: [],
        };
        return <TableOrder key={order.id} {...order} />;
      })}
    </div>
  );
}

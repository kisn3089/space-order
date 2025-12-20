import TableOrderDetail from "./components/table-orders/TableOrderDetail";
import TableOrders from "./components/table-orders/TableOrders";

export default function OrdersPage() {
  return (
    <>
      <TableOrders />
      <TableOrderDetail />
    </>
  );
}

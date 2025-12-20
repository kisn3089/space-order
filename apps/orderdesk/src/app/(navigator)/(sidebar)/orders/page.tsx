import TableOrderDetail from "./components/table-detail/TableOrderDetail";
import TableOrders from "./components/table-orders/TableOrders";

export default function OrdersPage() {
  return (
    <>
      <TableOrders />
      <TableOrderDetail />
    </>
  );
}

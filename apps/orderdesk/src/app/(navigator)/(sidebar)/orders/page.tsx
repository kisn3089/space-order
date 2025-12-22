import TableOrderDetail from "./components/table-order-detail/TableOrderDetail";
import TableOrders from "./components/table-orders/TableOrders";

export default function OrdersPage() {
  return (
    <>
      <TableOrders />
      <TableOrderDetail />
    </>
  );
}

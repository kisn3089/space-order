import { OrderDetailControlbar } from "./order-detail/OrderDetailControlbar";
import { OrderDetailFooter } from "./order-detail/OrderDetailFooter";

type TableOrderDetailLayoutProps = {
  children: React.ReactNode;
  renderPayment: React.ReactNode;
};
export default function TableOrderDetailLayout({
  children,
  renderPayment,
}: TableOrderDetailLayoutProps) {
  return (
    <>
      {children}
      <OrderDetailFooter>
        <OrderDetailControlbar />
        {renderPayment}
      </OrderDetailFooter>
    </>
  );
}

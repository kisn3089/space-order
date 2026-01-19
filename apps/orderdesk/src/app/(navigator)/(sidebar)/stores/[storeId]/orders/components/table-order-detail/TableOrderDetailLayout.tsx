import PaymentControlbar from "./PaymentControlbar";

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
      <footer className="flex flex-col gap-2 p-2">
        <PaymentControlbar>{renderPayment}</PaymentControlbar>
      </footer>
    </>
  );
}

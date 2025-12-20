import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description: "orders page",
};

export default function OrdersLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased h-full grid place-items-center gap-2 grid-cols-[2fr_minmax(380px,1fr)] px-6">
      {children}
    </section>
  );
}

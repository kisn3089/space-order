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
    <section className="antialiased min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center">
      {children}
    </section>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "대시보드",
  description: "매장의 주문 현황과 통계를 전반적으로 확인해보세요.",
};

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <section className="antialiased h-full">{children}</section>;
}

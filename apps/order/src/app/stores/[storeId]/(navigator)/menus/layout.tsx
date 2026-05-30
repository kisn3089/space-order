import { Metadata } from "next";

export const metadata: Metadata = {
  title: "메뉴 - TADER",
  description: "메뉴를 확인하고 주문해보세요.",
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

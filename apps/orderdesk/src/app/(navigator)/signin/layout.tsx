import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인 - ACCEPTOR",
  description: "로그인하여 주문을 관리하세요.",
};

export default function SignInLayout({
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

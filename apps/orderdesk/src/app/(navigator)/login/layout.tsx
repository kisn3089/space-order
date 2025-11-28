import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "login",
  description: "login to use web services",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <section className="antialiased">{children}</section>;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "login",
  description: "login to use web services",
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

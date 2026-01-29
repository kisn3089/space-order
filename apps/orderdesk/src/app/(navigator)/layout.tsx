import { ToggleTheme } from "@/components/theme/ToggleTheme";
import Link from "next/link";

export default function NavigatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased">
      <nav className="flex justify-between px-6 items-center w-screen h-14 bg-edge-background">
        <Link href="/dashboard" className="font-bold text-lg">
          ACCEPTOR
        </Link>
        <div className="flex flex-row items-center gap-4">
          <ToggleTheme />
        </div>
      </nav>
      {children}
    </section>
  );
}

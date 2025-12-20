import { ToggleTheme } from "@/components/theme/ToggleTheme";

export default function NavigatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased">
      <nav className="flex justify-between px-6 items-center w-screen h-14 bg-edge-background">
        <div className="font-bold text-lg">ACCEPTOR</div>
        <div className="flex flex-row items-center gap-4">
          <ToggleTheme />
        </div>
      </nav>
      {children}
    </section>
  );
}

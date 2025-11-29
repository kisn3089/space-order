import { ToggleTheme } from "@/src/components/theme/ToggleTheme";

export default function NavigatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased">
      <nav className="flex justify-between px-6 items-center w-screen h-16 bg-cyan-50">
        <div>LOGO</div>
        <div className="flex flex-row items-center gap-4">
          <h3>User</h3>
          <ToggleTheme />
        </div>
      </nav>
      {children}
    </section>
  );
}

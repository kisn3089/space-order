import { ToggleTheme } from "@/components/theme/ToggleTheme";
import UserName from "./components/UserName";

export default function NavigatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased">
      <nav className="flex justify-between px-6 items-center w-screen h-16">
        <div className="font-bold text-lg">HANCO</div>
        <div className="flex flex-row items-center gap-4">
          <ToggleTheme />
          <UserName />
        </div>
      </nav>
      {children}
    </section>
  );
}

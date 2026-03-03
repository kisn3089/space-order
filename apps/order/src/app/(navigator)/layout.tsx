import NavLogoLink from "./components/NavLogoLink";
import NavTableNumber from "./components/NavTableNumber";

export default function NavigatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex flex-col items-center sticky bg-white top-0 z-10">
        <nav className="w-full h-12 flex items-center justify-between px-4">
          <NavLogoLink />
          <NavTableNumber />
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}

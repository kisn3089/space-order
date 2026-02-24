import { Separator } from "@spaceorder/ui/components/separator";
import StoreName from "./components/StoreName";
import TableNumber from "./components/TableNumber";
import CartLink from "./components/CartLink";
import Image from "next/image";

export default function NavigatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="flex flex-col items-center sticky bg-white top-0 z-10">
        <nav className="w-full h-12 flex items-center justify-between px-4">
          <div className="flex items-center gap-x-2 min-w-0">
            <Image
              src={"/logo.png"}
              alt="Logo"
              width={20}
              height={20}
              className="shrink-0"
            />
            <StoreName storeName="스페이스 카페 본점" />
          </div>
          <div className="flex items-center gap-4 h-full py-3">
            <TableNumber tableNumber="2" />
            <Separator orientation="vertical" />
            <CartLink itemCount={1} />
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </>
  );
}

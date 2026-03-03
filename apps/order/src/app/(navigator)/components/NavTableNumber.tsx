import { Separator } from "@spaceorder/ui/components/separator";
import TableNumber from "./TableNumber";
import CartLink from "./CartLink";

export default function NavTableNumber() {
  return (
    <div className="flex items-center gap-4 h-full py-3">
      <TableNumber tableNumber="2" />
      <Separator orientation="vertical" />
      <CartLink />
    </div>
  );
}

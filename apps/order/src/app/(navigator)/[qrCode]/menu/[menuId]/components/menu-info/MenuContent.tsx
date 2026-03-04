import {
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemTitle,
} from "@spaceorder/ui/components/item";
import { PublicMenu } from "@spaceorder/db/types";
import { transCurrencyFormat } from "@spaceorder/api/utils/priceFormatter";

type MenuContentProps = {
  menu: PublicMenu;
  children: React.ReactNode;
};
export default function MenuContent({ menu, children }: MenuContentProps) {
  return (
    <ItemContent className="w-full px-2">
      <ItemTitle className="font-bold text-xl">{menu.name}</ItemTitle>
      <ItemDescription className="text-base line-clamp-none">
        {menu.description}
      </ItemDescription>
      <ItemFooter className="text-xl font-semibold text-primary py-6">
        {transCurrencyFormat(menu.price)}
        {children}
      </ItemFooter>
    </ItemContent>
  );
}

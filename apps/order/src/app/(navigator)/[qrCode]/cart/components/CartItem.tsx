import {
  CardContent,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";
import MenuImage from "../../../components/MenuImage";
import { X } from "lucide-react";
import { Button } from "@spaceorder/ui/components/button";
import { transCurrencyFormat } from "@spaceorder/api/utils/priceFormatter";
import { CartOrderItem } from "./CartOrderItems";

type CartItemProps = {
  children: React.ReactNode;
  cartItem: CartOrderItem;
};

export default function CartItem({ children, cartItem }: CartItemProps) {
  const options = Object.entries(
    Object.assign({}, cartItem.requiredOptions, cartItem.customOptions)
  );

  return (
    <CardHeader className="flex flex-row gap-x-4 p-4">
      <MenuImage src={cartItem.image} alt={cartItem.menuName} size="item" />
      <div className="w-full">
        <div className="flex justify-between w-full">
          <div className="flex flex-col">
            <CardTitle className="text-lg flex-1">
              {cartItem.menuName}
            </CardTitle>
            <CardContent className="p-0 font-semibold">
              {transCurrencyFormat(cartItem.price)}
            </CardContent>
            <div className="pt-2">
              {options.map(([key, value]) => (
                <div key={key} className="flex gap-x-2 text-sm">
                  <p className="font-semibold text-black">{key}</p>
                  <p className="text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant={"ghost"}
            className="py-1 px-2 size-2 h-fit hover:bg-transparent"
            onClick={() =>
              // TODO: 카트에서 제거하는 API로 변경 필요
              console.log("해당 메뉴 카트에서 제거!: ", cartItem.menuName)
            }
          >
            <X className="cursor-pointer shrink-0 size-5" />
          </Button>
        </div>
        <div className="flex justify-end pt-3">{children}</div>
      </div>
    </CardHeader>
  );
}

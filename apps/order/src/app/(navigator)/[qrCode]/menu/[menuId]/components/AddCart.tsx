import { EntriesdMenuOptionItem } from "@/app/(navigator)/components/MENU_DATA";
import { PublicMenu } from "@spaceorder/db/types";
import { Button } from "@spaceorder/ui/components/button";

type AddCartProps = {
  menu: PublicMenu;
  quantity: number;
  options: EntriesdMenuOptionItem[];
  selectedOptions: Map<string, string>;
};
export default function AddCart({
  menu,
  quantity,
  options,
  selectedOptions,
}: AddCartProps) {
  const price =
    quantity *
    (menu.price +
      options.reduce((acc, option) => {
        const selectedKey = selectedOptions.get(option.key);
        const selectedOption = option.value.options.find(
          (opt) => opt.key === selectedKey
        );
        return acc + (selectedOption ? selectedOption.price : 0);
      }, 0));

  const addToCart = () => {
    const cartItem = {
      menuPublicId: menu.publicId,
      menuName: menu.name,
      price,
      quantity,
      options: Object.fromEntries(selectedOptions),
    };

    console.log("장바구니에 담기:", cartItem);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto">
      <footer className="bg-white border-t border-border p-4">
        <Button
          className="w-full h-12 font-bold tracking-wide"
          onClick={addToCart}
          disabled={!menu.isAvailable}
        >
          {menu.isAvailable
            ? `${price.toLocaleString("ko-KR")}원 - 장바구니 담기`
            : "현재 주문이 불가능한 메뉴입니다."}
        </Button>
      </footer>
    </div>
  );
}

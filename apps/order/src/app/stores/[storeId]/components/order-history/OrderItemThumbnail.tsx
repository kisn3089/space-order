import MenuImage from "../../(navigator)/menus/components/MenuImage";
import CountIcon from "../../(navigator)/common/CountIcon";

type OrderItemThumbnailProps = {
  menuImageUrl: string | null;
  menuName: string;
  quantity: number;
};
export default function OrderItemThumbnail({
  menuImageUrl,
  menuName,
  quantity,
}: OrderItemThumbnailProps) {
  return (
    <div className="flex flex-col gap-y-2 w-fit">
      <div className="relative w-fit">
        <MenuImage
          size="item"
          src={menuImageUrl}
          alt={menuName}
          className="rounded-xl"
        />
        <CountIcon
          count={quantity}
          color="white"
          size="sm"
          className="border-2 border-black -bottom-1 -right-1"
        />
      </div>
      <span className="font-semibold text-sm text-center">{menuName}</span>
    </div>
  );
}

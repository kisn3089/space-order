import { ItemMedia } from "@spaceorder/ui/components/item";
import Image from "next/image";

type MenuImageSize = "cover" | "item";
type MenuImagePreset = {
  class: string;
  width: number;
  height: number;
};

const sizeClassMap = {
  cover: {
    class: "w-full h-svw max-h-[calc(100vh-36rem)]",
    width: 1080,
    height: 480,
  },
  item: {
    class: "size-24",
    width: 240,
    height: 120,
  },
} satisfies Record<MenuImageSize, MenuImagePreset>;

type MenuImageProps = {
  src: string | null;
  alt: string;
  size: MenuImageSize;
  className?: string;
};
export default function MenuImage({
  src,
  alt,
  size,
  className = "",
}: MenuImageProps) {
  return (
    <ItemMedia
      variant={"image"}
      className={`${sizeClassMap[size].class} ${className}`}
    >
      <Image
        src={src || "/coffee_sample.jpg"}
        alt={alt}
        width={sizeClassMap[size].width}
        height={sizeClassMap[size].height}
      />
    </ItemMedia>
  );
}

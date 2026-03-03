import { ItemMedia } from "@spaceorder/ui/components/item";
import Image from "next/image";

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
} as const;

type MenuImageProps = {
  src: string | null;
  alt: string;
  size: "cover" | "item";
  className?: string;
  children?: React.ReactNode;
};
export default function MenuImage({
  src,
  alt,
  size,
  className = "",
  children,
}: MenuImageProps) {
  return (
    <ItemMedia
      variant={"image"}
      className={`w-full h-svw ${sizeClassMap[size].class} ${className}`}
    >
      <Image
        src={src || "/coffee_sample.jpg"}
        alt={alt}
        width={sizeClassMap[size].width}
        height={sizeClassMap[size].height}
      />
      {children}
    </ItemMedia>
  );
}

type CountIconProps = {
  count: number;
  className?: string;
  color?: "white" | "black";
  size?: "xs" | "sm";
};

const colorStyle = {
  white: "bg-white text-black",
  black: "bg-black text-white",
};

const sizeStyle = {
  xs: "w-4 h-4 text-[0.5rem]",
  sm: "w-5 h-5 text-[0.7rem]",
};

export default function CountIcon({
  count,
  className,
  color = "black",
  size = "xs",
}: CountIconProps) {
  return (
    <div
      className={`absolute ${sizeStyle[size] ?? ""} grid place-content-center ${colorStyle[color] ?? ""} rounded-full text-[0.6rem] font-semibold ${className ?? ""}`}
    >
      {count}
    </div>
  );
}

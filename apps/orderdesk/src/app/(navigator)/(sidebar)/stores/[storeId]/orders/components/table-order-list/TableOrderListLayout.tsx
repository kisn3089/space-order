type TableBoardLayoutProps = {
  count: number;
} & React.PropsWithChildren;
export default function TableBoardLayout({
  children,
  count,
}: TableBoardLayoutProps) {
  const tableBoardMaxHeight =
    count < 3 ? "grid-rows-[max(50%)]" : "auto-rows-fr";

  return (
    <div
      className={`w-full h-full grid grid-cols-2 ${tableBoardMaxHeight} gap-3 min-w-[410px]`}
    >
      {children}
    </div>
  );
}

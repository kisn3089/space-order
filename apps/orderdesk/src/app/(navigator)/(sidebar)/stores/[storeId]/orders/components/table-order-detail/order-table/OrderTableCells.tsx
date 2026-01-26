import { TableCell } from "@spaceorder/ui/components/table";
import { flexRender, Row } from "@tanstack/react-table";

export default function OrderTableCells<TData>({ row }: { row: Row<TData> }) {
  return (
    <TableCell className="grid grid-cols-[2fr_1fr_1fr] cursor-pointer min-h-16 animate-fade-in-up">
      {row.getVisibleCells().map((cell) => (
        <div
          key={cell.id}
          className={`flex items-center font-semibold text-base overflow-hidden`}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      ))}
    </TableCell>
  );
}

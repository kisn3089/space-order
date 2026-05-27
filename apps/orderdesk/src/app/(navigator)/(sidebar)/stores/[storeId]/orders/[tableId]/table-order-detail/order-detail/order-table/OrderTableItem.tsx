"use no memo";
/**
 * @description 주문 상세 테이블의 각 행을 렌더링하는 컴포넌트입니다.
 * 주문 아이템의 수량을 변경하기 위해 선택 상태에 따른 리렌더링이 필요하지만,
 * rowSelection 객체가 변경되어도 row 객체 참조값은 변경되지 않기 때문에
 * react compiler가 메모이제이션을 적용하여 리렌더링이 발생하지 않아, 수량 변경이 UI에 반영되지 않는 문제가 있었습니다.
 * 따라서, 해당 컴포넌트에서는 메모이제이션을 적용하지 않도록 "use no memo" 지시어를 사용하였습니다.
 */

import { TableCell } from "@spaceorder/ui/components/table";
import { flexRender, Row } from "@tanstack/react-table";

type OrderTableItemProps<TData> = {
  row: Row<TData>;
};
export function OrderTableItem<TData>({ row }: OrderTableItemProps<TData>) {
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

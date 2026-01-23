import { TableCell } from "@spaceorder/ui/components/table";
import { columns } from "../columns";
import { Button } from "@spaceorder/ui/components/button";

type EditControllerProps = {
  setChanges: (e: React.MouseEvent<HTMLButtonElement>) => void;
  remove: (e: React.MouseEvent<HTMLButtonElement>) => void;
};
export default function EditController({
  remove,
  setChanges,
}: EditControllerProps) {
  return (
    <TableCell colSpan={columns.length} className="p-0">
      <div className="w-full grid grid-cols-[1fr_2fr] gap-2 p-2">
        <Button variant={"destructive"} onClick={remove}>
          삭제
        </Button>
        <Button variant={"default"} onClick={setChanges}>
          적용
        </Button>
      </div>
    </TableCell>
  );
}

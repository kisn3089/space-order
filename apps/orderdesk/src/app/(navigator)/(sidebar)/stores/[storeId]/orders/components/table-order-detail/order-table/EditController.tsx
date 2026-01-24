import { TableCell } from "@spaceorder/ui/components/table";
import { columns } from "../columns";
import { Button } from "@spaceorder/ui/components/button";
import { AlertDialogWrapper } from "@spaceorder/ui/components/alert-dialog/AlertDialogWrapper";
import { AlertDialogAction } from "@spaceorder/ui/components/alert-dialog/alert-dialog";

const dialogTitle = "해당 기능은 준비 중입니다.";
const dialogDescription = "업데이트를 기다려주세요!";

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
      <div className="w-full grid grid-cols-[1fr_2fr_3fr] gap-2 p-2">
        <Button
          className="font-semibold"
          variant={"destructive"}
          onClick={remove}
        >
          삭제
        </Button>
        <AlertDialogWrapper
          title={dialogTitle}
          description={dialogDescription}
          renderFooter={() => <AlertDialogAction>확인</AlertDialogAction>}
        >
          <Button
            className="font-semibold"
            variant={"outline"}
            onClick={(e) => e.stopPropagation()}
          >
            메뉴 변경
          </Button>
        </AlertDialogWrapper>
        <Button
          className="font-semibold"
          variant={"default"}
          onClick={setChanges}
        >
          적용
        </Button>
      </div>
    </TableCell>
  );
}

import { OptionSnapshotValue } from "@spaceorder/db/types/menuOptions.type";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import { Badge } from "@spaceorder/ui/components/badge";
import { TableCell } from "@spaceorder/ui/components/table";
import { OrderItemWithSummarizedOrder } from "../OrderDetailTable";

interface OrderTableOptionsProps {
  optionsSnapshot: OrderItemWithSummarizedOrder["optionsSnapshot"];
  isSelected: boolean;
}
export function OrderTableOptions({
  optionsSnapshot,
  isSelected,
}: OrderTableOptionsProps) {
  return (
    <ActivityRender mode={optionsSnapshot ? "visible" : "hidden"}>
      <TableCell className="flex gap-1 flex-wrap pt-4 px-4 pb-0">
        <OptionsSnapshotBadge
          options={optionsSnapshot?.requiredOptions}
          isSelected={isSelected}
          type="required"
        />
        <OptionsSnapshotBadge
          options={optionsSnapshot?.customOptions}
          isSelected={isSelected}
          type="custom"
        />
      </TableCell>
    </ActivityRender>
  );
}

function OptionsSnapshotBadge({
  options,
  isSelected,
  type,
}: {
  options: OptionSnapshotValue | undefined;
  isSelected: boolean;
  type: "required" | "custom";
}) {
  const entries = Object.entries(options || {});
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map(([key, value]) => (
        <Badge
          key={key}
          className="whitespace-pre-wrap text-center tabular-nums"
          variant={type === "required" ? "destructive" : "default"}
        >{`${key}: ${value.key} ${isSelected && value.price !== 0 ? `\n${value.price}` : ""}`}</Badge>
      ))}
    </>
  );
}

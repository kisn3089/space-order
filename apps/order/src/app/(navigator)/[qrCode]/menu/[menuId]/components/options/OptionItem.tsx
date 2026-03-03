import {
  EntriesdMenuOptionItem,
  MenuOptionItem,
} from "@/app/(navigator)/components/MENU_DATA";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import { Button } from "@spaceorder/ui/components/button";
import { Item, ItemTitle } from "@spaceorder/ui/components/item";

type OptionItemProps = {
  option: EntriesdMenuOptionItem;
  selectedOptions: Map<string, string>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Map<string, string>>>;
};
export default function OptionItem({
  option,
  selectedOptions,
  setSelectedOptions,
}: OptionItemProps) {
  const { key, value } = option;

  const changeOption = (optionKey: string) => {
    setSelectedOptions((prev) => {
      const newMap = new Map(prev);
      newMap.set(key, optionKey);
      return newMap;
    });
  };

  const isTriggered = isTrigger(value, selectedOptions);

  return (
    <ActivityRender mode={isTriggered ? "visible" : "hidden"}>
      <Item className="flex-nowrap py-2">
        <ItemTitle className="font-bold text-base whitespace-pre">
          {key}
        </ItemTitle>
        <div className="grid grid-flow-col auto-cols-fr gap-2">
          {value.options.map((opt) => {
            const selected = selectedOptions.get(key) === opt.key;

            return (
              <Button
                key={opt.key}
                variant={selected ? "default" : "outline"}
                className={`h-14 min-w-fit font-semibold border`}
                onClick={() => changeOption(opt.key)}
              >
                <div className="flex flex-col">
                  <span>{opt.key}</span>
                  <ActivityRender mode={opt.price > 0 ? "visible" : "hidden"}>
                    <span>{`+${opt.price.toLocaleString("ko-KR")}원`}</span>
                  </ActivityRender>
                </div>
              </Button>
            );
          })}
        </div>
      </Item>
    </ActivityRender>
  );
}

function isTrigger(
  value: MenuOptionItem["value"],
  selectedOptions: Map<string, string>
): boolean {
  if (
    value.trigger === null ||
    value.trigger === undefined ||
    value.trigger.length === 0
  ) {
    return true;
  }

  return !value.trigger.every((trigger) => {
    const selectedOption = selectedOptions.get(trigger.group);
    return trigger.in.includes(selectedOption || "");
  });
}

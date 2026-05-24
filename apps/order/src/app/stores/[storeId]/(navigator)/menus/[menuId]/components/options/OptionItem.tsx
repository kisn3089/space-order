import { isTrigger } from "@/utils/optionTrigger";
import { MenuOptionEntry } from "@spaceorder/db/types";
import ActivityRender from "@spaceorder/ui/components/activity-render/ActivityRender";
import { Button } from "@spaceorder/ui/components/button";
import { Item, ItemTitle } from "@spaceorder/ui/components/item";

type OptionItemProps = {
  option: MenuOptionEntry;
  selectedOptions: Map<string, string>;
  changeOption: (optionGroupKey: string, optionKey: string) => void;
};
export default function OptionItem({
  option,
  selectedOptions,
  changeOption,
}: OptionItemProps) {
  const { key, optionInfo } = option;

  const isTriggered = isTrigger(optionInfo, selectedOptions);

  return (
    <Item className="flex-nowrap py-2">
      <ItemTitle className="font-bold text-base whitespace-pre">
        {key}
      </ItemTitle>
      <div className="grid grid-flow-col auto-cols-fr gap-2">
        {optionInfo.options.map((opt) => {
          const selected = selectedOptions.get(key) === opt.key;

          return (
            <Button
              key={opt.key}
              variant={selected ? "default" : "outline"}
              className={`h-14 min-w-fit font-semibold border rounded-xl`}
              onClick={() => changeOption(key, opt.key)}
              disabled={!isTriggered}
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
  );
}

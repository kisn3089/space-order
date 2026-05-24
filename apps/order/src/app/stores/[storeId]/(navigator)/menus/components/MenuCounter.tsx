import { Button } from "@spaceorder/ui/components/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@spaceorder/ui/components/button-group";
import { MinusIcon, PlusIcon } from "lucide-react";

export default function MenuCounter({
  isAvailable = true,
  quantity,
  changeQuantity,
}: {
  isAvailable?: boolean;
  quantity: number;
  changeQuantity: (newQuantity: number) => void;
}) {
  const disabled = quantity <= 1;

  return (
    <ButtonGroup>
      <Button
        variant={"outline"}
        size={"icon"}
        disabled={disabled || !isAvailable}
        className="border-r-0 disabled:opacity-100 shadow-sm"
        onClick={() => changeQuantity(Math.max(1, quantity - 1))}
      >
        <MinusIcon className={disabled || !isAvailable ? "opacity-30" : ""} />
      </Button>
      <ButtonGroupText
        className={`justify-center min-w-10 border-x-0 font-semibold text-base bg-background px-2 ${!isAvailable ? "text-muted-foreground" : ""}`}
      >
        {quantity}
      </ButtonGroupText>
      <Button
        variant={"outline"}
        size={"icon"}
        className="border-l-0 disabled:opacity-100 shadow-sm"
        onClick={() => changeQuantity(quantity + 1)}
        disabled={!isAvailable}
      >
        <PlusIcon className={!isAvailable ? "opacity-30" : ""} />
      </Button>
    </ButtonGroup>
  );
}

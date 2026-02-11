import {
  MenuValidationFields,
  validateMenuMismatchOrThrow,
} from "../menu/mismatch";
import { Prisma } from "@spaceorder/db";
import { getValidatedMenuOptionsSnapshot } from "../menu/options";
import { ExtendedMap } from "src/utils/helper/extendMap";
import { CreateOrderPayloadDto } from "src/dto/order.dto";
import { validateMenuAvailableOrThrow } from "../menu/available";

export function createOrderItemsWithValidMenu(
  createOrderDto: CreateOrderPayloadDto,
  findMenuList: MenuValidationFields[],
  menuPublicIds: string[]
): Prisma.OrderItemCreateWithoutOrderInput[] {
  const menuMap = new ExtendedMap<string, MenuValidationFields>(
    findMenuList.map((menu) => [menu.publicId, menu])
  );
  menuMap.setException("MENU_MISMATCH");

  validateMenuMismatchOrThrow(findMenuList, menuPublicIds);

  const bulkCreateOrderItems: Prisma.OrderItemCreateNestedManyWithoutOrderInput["create"] =
    createOrderDto.orderItems.map((orderItem) => {
      const menu = menuMap.getOrThrow(orderItem.menuPublicId);
      validateMenuAvailableOrThrow(menu);
      const { optionsPrice, optionsSnapshot } = getValidatedMenuOptionsSnapshot(
        menu,
        {
          requiredOptions: orderItem.requiredOptions,
          customOptions: orderItem.customOptions,
        }
      );

      return {
        menu: { connect: { publicId: orderItem.menuPublicId } },
        menuName: menu.name,
        basePrice: menu.price,
        unitPrice: menu.price + optionsPrice,
        optionsPrice,
        quantity: orderItem.quantity,
        optionsSnapshot,
      };
    });

  return bulkCreateOrderItems;
}

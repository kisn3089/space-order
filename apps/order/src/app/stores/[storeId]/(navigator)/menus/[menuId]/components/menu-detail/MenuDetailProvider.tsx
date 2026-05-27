"use client";

import { useState } from "react";
import type { PublicMenu, MenuOptionEntry } from "@spaceorder/db/types";
import {
  MenuDetailContext,
  type MenuDetailContextValue,
  type SelectedOptions,
} from "./MenuDetailContext";
import { AxiosError } from "axios";
import { toast } from "@spaceorder/ui/components/sonner";
import { AddCartItemPayload, useCartMutations } from "@spaceorder/api/core";
import { deleteNotTriggeredOptions } from "@/utils/optionTrigger";

interface MenuDetailProviderProps {
  menu: PublicMenu;
  children: React.ReactNode;
}

export function MenuDetailProvider({
  menu,
  children,
}: MenuDetailProviderProps) {
  const addCartMutate = useCartMutations().add;

  const requiredOptions = toOptionEntries(menu.requiredOptions);
  const customOptions = toOptionEntries(menu.customOptions);
  const allOptions = [...requiredOptions, ...customOptions];

  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(
    () => ({
      required: toDefaultSelection(requiredOptions),
      custom: toDefaultSelection(customOptions),
    })
  );

  const allSelectedOptions = new Map<string, string>([
    ...selectedOptions.required,
    ...selectedOptions.custom,
  ]);

  const price =
    quantity *
    (menu.price +
      allOptions.reduce((acc, option) => {
        const selectedKey = allSelectedOptions.get(option.key);
        const selectedOption = option.optionInfo.options.find(
          (opt) => opt.key === selectedKey
        );
        return acc + (selectedOption ? selectedOption.price : 0);
      }, 0));

  const selectRequiredOption = (groupKey: string, optionKey: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      required: new Map(prev.required).set(groupKey, optionKey),
    }));
  };

  const selectCustomOption = (groupKey: string, optionKey: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      custom: new Map(prev.custom).set(groupKey, optionKey),
    }));
  };

  const addCart = async () => {
    const deletedNotTriggeredOptions = deleteNotTriggeredOptions(
      allOptions,
      selectedOptions.custom,
      allSelectedOptions
    );
    const cartItem: AddCartItemPayload = {
      menuPublicId: menu.publicId,
      quantity,
      ...(selectedOptions["required"].size > 0 && {
        requiredOptions: Object.fromEntries(selectedOptions["required"]),
      }),
      ...(deletedNotTriggeredOptions.size > 0 && {
        customOptions: Object.fromEntries(deletedNotTriggeredOptions),
      }),
    };

    try {
      await addCartMutate.mutateAsync(cartItem);
      toast.success(`${menu.name} 메뉴가 장바구니에 추가되었습니다.`);
    } catch (error: unknown) {
      let message = "장바구니에 담는 중 오류가 발생했습니다.";
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          message = "세션이 만료되었습니다. 다시 QR코드를 스캔해주세요.";
        }
      }
      toast.error(message);
    }
  };

  const contextValue: MenuDetailContextValue = {
    state: { menu, quantity, selectedOptions },
    actions: { setQuantity, selectRequiredOption, selectCustomOption, addCart },
    meta: {
      requiredOptions,
      customOptions,
      allSelectedOptions,
      price,
      addCartMutate,
    },
  };

  return (
    <MenuDetailContext.Provider value={contextValue}>
      {children}
    </MenuDetailContext.Provider>
  );
}

function toOptionEntries(
  options: PublicMenu["requiredOptions"] | PublicMenu["customOptions"]
): MenuOptionEntry[] {
  if (!options) return [];
  return Object.entries(options).map(([key, value]) => ({
    key,
    optionInfo: value,
  }));
}

function toDefaultSelection(entries: MenuOptionEntry[]): Map<string, string> {
  return new Map(
    entries.map(({ key, optionInfo }) => [key, optionInfo.defaultKey])
  );
}

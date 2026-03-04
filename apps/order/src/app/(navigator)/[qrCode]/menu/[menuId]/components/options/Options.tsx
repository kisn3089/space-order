"use client";

import OptionItem from "./OptionItem";
import { MenuOptionEntry } from "@/app/(navigator)/components/MENU_DATA";

type OptionsProps = {
  options: MenuOptionEntry[];
  selectedOptions: Map<string, string>;
  setSelectedOptions: React.Dispatch<React.SetStateAction<Map<string, string>>>;
};

export default function Options({
  options,
  selectedOptions,
  setSelectedOptions,
}: OptionsProps) {
  return (
    <section className="bg-white py-4 pb-[81px]">
      {options.map((option) => (
        <OptionItem
          key={option.key}
          option={option}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
      ))}
    </section>
  );
}

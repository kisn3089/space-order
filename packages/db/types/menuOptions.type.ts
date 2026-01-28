export type MenuOptionValue = {
  key: string;
  description?: string;
  price: number;
};

export type MenuCustomOptionValue = {
  options: MenuOptionValue[];
  trigger?: { group: string; in: string[] }[];
};

export type MenuRequiredOption = Record<string, MenuOptionValue[]>;
export type MenuCustomOption = Record<string, MenuCustomOptionValue>;

export type MenuOption = {
  requiredOptions: MenuRequiredOption | null;
  customOptions: MenuCustomOption | null;
};

export type OptionSnapshotValue = Record<string, MenuOptionValue>;
export type OrderItemOptionSnapshot = {
  requiredOptions?: OptionSnapshotValue;
  customOptions?: OptionSnapshotValue;
};

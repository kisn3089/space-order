export type MenuOption = {
  key: string;
  description?: string;
  price: number;
};

export type MenuRequiredOptions = Record<string, MenuOption[]>;

export type MenuCustomOption = {
  options: MenuOption[];
  trigger?: { group: string; in: string[] }[];
};

export type MenuCustomOptions = Record<string, MenuCustomOption>;

export type OptionsSnapshot = {
  requiredOptions: MenuRequiredOptions | null;
  customOptions: MenuCustomOptions | null;
};

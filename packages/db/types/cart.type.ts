import { PublicOrderItem } from "./publicModel.type";

export type PublicCartItem = Omit<PublicOrderItem, "publicId" | "createdAt"> & {
  id: string;
  menuPublicId: string;
  image: string | null;
  requiredOptions: Record<string, string> | null;
  customOptions: Record<string, string> | null;
  addedAt: string;
};

export type Cart = {
  sessionToken: string;
  menus: PublicCartItem[];
  updatedAt: string;
};

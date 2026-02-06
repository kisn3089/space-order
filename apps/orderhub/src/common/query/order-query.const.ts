import { SESSION_FILTER_RECORD } from './session-query.const';

export const ORDER_ITEMS_WITH_OMIT_PRIVATE = {
  include: {
    orderItems: { omit: { id: true, orderId: true, menuId: true } },
  },
  omit: {
    id: true,
    storeId: true,
    tableId: true,
    tableSessionId: true,
  },
} as const;

export const MENU_VALIDATION_FIELDS_SELECT = {
  id: true,
  publicId: true,
  name: true,
  price: true,
  requiredOptions: true,
  customOptions: true,
  isAvailable: true,
} as const;

export const ORDER_SITUATION_PAYLOAD = {
  tableSessions: {
    ...SESSION_FILTER_RECORD['alive-session'](),
    select: {
      publicId: true,
      expiresAt: true,
      orders: {
        select: {
          publicId: true,
          status: true,
          orderItems: {
            select: {
              publicId: true,
              menuName: true,
              quantity: true,
            },
          },
        },
      },
    },
  },
} as const;

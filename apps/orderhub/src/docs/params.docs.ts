export const paramsDocs = {
  storeId: { name: 'storeId', description: '매장 고유 ID' },
  tableId: { name: 'tableId', description: '테이블 고유 ID' },
  menuId: { name: 'menuId', description: '메뉴 고유 ID' },
  orderId: { name: 'orderId', description: '주문 고유 ID' },
  orderItemId: { name: 'orderItemId', description: '주문 항목 고유 ID' },
  ownerId: { name: 'ownerId', description: '매장 소유자 고유 ID' },
  sessionId: { name: 'sessionId', description: '세션 고유 ID' },
  adminId: { name: 'adminId', description: '관리자 고유 ID' },
  query: {
    filter: { name: 'filter', required: false, description: '필터 옵션' },
    include: { name: 'include', required: false, description: '포함할 리소스' },
  },
};

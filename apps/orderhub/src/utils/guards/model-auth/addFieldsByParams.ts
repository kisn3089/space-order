/** TODO: deprecated */

type VerifyParams = {
  storeId: string;
  menuId: string;
  tableId: string;
  orderId: string;
  orderItemId: string;
  tableSessionId: string;
};

export const addFieldsByParams = (params: Partial<VerifyParams>) => {
  const { storeId, menuId, tableId, orderId, orderItemId, tableSessionId } =
    params;

  const store = { store: { publicId: storeId } };
  const menu = { menu: { publicId: menuId } };
  const table = { table: { publicId: tableId } };
  const order = { order: { publicId: orderId } };
  const orderItem = { orderItem: { publicId: orderItemId } };
  const tableSession = { tableSession: { publicId: tableSessionId } };

  return {
    ...(storeId ? store : {}),
    ...(menuId ? menu : {}),
    ...(tableId ? table : {}),
    ...(orderId ? order : {}),
    ...(orderItemId ? orderItem : {}),
    ...(tableSessionId ? tableSession : {}),
  };
};

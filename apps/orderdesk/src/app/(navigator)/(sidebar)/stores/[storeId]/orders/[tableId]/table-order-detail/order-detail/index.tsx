/**
 * TableOrderDetailCard Compound Component
 *
 * 사용 예시:
 * <TableOrderDetailCard.Provider params={params}>
 *   <TableOrderDetailCard.Content>
 *     <TableOrderDetailCard.Table />
 *     <TableOrderDetailCard.Footer>
 *       <TableOrderDetailCard.Controlbar />
 *       <TableOrderDetailCard.PaymentButton />
 *     </TableOrderDetailCard.Footer>
 *   </TableOrderDetailCard.Content>
 * </TableOrderDetailCard.Provider>
 */

import { OrderDetailProvider } from "./OrderDetailProvider";
import { OrderDetailContent } from "./OrderDetailContent";
import { OrderDetailFooter } from "./OrderDetailFooter";
import { OrderDetailControlbar } from "./OrderDetailControlbar";
import { OrderDetailPayment } from "./OrderDetailPayment";
import {
  OrderDetailContext,
  useOrderDetailContext,
} from "./OrderDetailContext";
import { OrderDetailTable } from "./OrderDetailTable";

export const OrderDetail = {
  Provider: OrderDetailProvider,
  Content: OrderDetailContent,
  Table: OrderDetailTable,
  Footer: OrderDetailFooter,
  Controlbar: OrderDetailControlbar,
  PaymentButton: OrderDetailPayment,
  Context: OrderDetailContext,
};

export { useOrderDetailContext as useTableOrderDetailContext };

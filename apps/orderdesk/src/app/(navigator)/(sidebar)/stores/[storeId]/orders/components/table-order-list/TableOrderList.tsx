import { SummarizedTableWithSessions } from "@spaceorder/db";
import { TableOrderCard } from "./table-order-card";

type TableBoardProps = {
  sanitizedTable: SummarizedTableWithSessions;
};

export default function TableOrderList({ sanitizedTable }: TableBoardProps) {
  return (
    <TableOrderCard.Provider table={sanitizedTable}>
      <TableOrderCard.Card>
        <TableOrderCard.Header />
        <TableOrderCard.Content>
          <TableOrderCard.AcceptAllButton />
          <TableOrderCard.OrderList />
        </TableOrderCard.Content>
        <TableOrderCard.Footer />
      </TableOrderCard.Card>
    </TableOrderCard.Provider>
  );
}

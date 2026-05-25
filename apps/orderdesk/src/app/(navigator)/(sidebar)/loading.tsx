"use client";

import { Skeleton } from "@spaceorder/ui/components/skeleton";
import TableBoardLayout from "./stores/[storeId]/orders/components/table-order-list/TableOrderListLayout";
import GridLayout from "./stores/[storeId]/orders/components/GridLayout";

export default function LoadingSkeleton() {
  return (
    <GridLayout>
      <TableBoardLayout count={8}>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} />
        ))}
      </TableBoardLayout>
      <div />
    </GridLayout>
  );
}

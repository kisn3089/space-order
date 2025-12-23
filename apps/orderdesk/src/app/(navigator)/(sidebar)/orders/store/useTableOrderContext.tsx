"use client";

// TODO: table DB 정립 후 react-query로 대체한다.
import React from "react";
import { TTableOrder } from "../components/table-orders/orderData";

const defaultTableOrder: TTableOrder = {
  id: 0,
  tableNum: 0,
  totalPrice: 0,
  orderItem: [],
};

const TalbeOrderContext = React.createContext<
  [TTableOrder, React.Dispatch<React.SetStateAction<TTableOrder>>]
>([defaultTableOrder, () => {}]);

type TableOrderProviderProps = {
  children: React.ReactNode;
};

export default function TableOrderProvider({
  children,
}: TableOrderProviderProps) {
  const [tableOrderState, setTableOrderState] =
    React.useState<TTableOrder>(defaultTableOrder);

  return (
    <TalbeOrderContext.Provider value={[tableOrderState, setTableOrderState]}>
      {children}
    </TalbeOrderContext.Provider>
  );
}

export function useTableOrderContext() {
  return React.useContext(TalbeOrderContext);
}

"use client";

import { createContext, use } from "react";
import type {
  SummarizedOrderWithItem,
  SummarizedTableWithSessions,
} from "@spaceorder/db";

/**
 * TableOrder Compound Component의 Context 인터페이스
 * - state: 테이블 및 세션 관련 상태
 * - actions: 주문 상태 변경 등의 액션
 * - meta: storeId, tableId 등 메타 정보
 */

// State
export interface TableOrderState {
  table: SummarizedTableWithSessions;
  session: SummarizedTableWithSessions["tableSessions"] extends (infer T)[]
    ? T | null
    : never;
  isActivatedTable: boolean;
  isSelected: boolean;
}

// Actions
export interface TableOrderActions {
  updateOrderStatus: (
    orderId: string,
    status: SummarizedOrderWithItem["status"]
  ) => Promise<void>;
}

// Meta
export interface TableOrderMeta {
  storeId: string;
  tableId: string;
}

// Context Value
export interface TableOrderContextValue {
  state: TableOrderState;
  actions: TableOrderActions;
  meta: TableOrderMeta;
}

export const TableOrderContext = createContext<TableOrderContextValue | null>(
  null
);

export function useTableOrderContext() {
  const context = use(TableOrderContext);
  if (!context) {
    throw new Error(
      "useTableOrderContext must be used within a TableOrderProvider"
    );
  }
  return context;
}

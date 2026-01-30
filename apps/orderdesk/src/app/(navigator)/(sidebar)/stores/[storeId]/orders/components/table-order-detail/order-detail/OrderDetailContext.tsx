"use client";

import { createContext, useContext } from "react";
import type { ResponseTableWithSessions } from "@spaceorder/db/types/responseModel.type";
import { OrderItemWithSummarizedOrder } from "./OrderDetailTable";

/**
 * TableOrderDetail Compound Component의 Context 인터페이스
 * - state: 테이블 세션, 주문 아이템, 총 금액, 편집 상태
 * - actions: 주문 아이템 수정/삭제, 선택 초기화
 * - meta: storeId, tableId, 로딩 상태
 */

// State
export interface OrderDetailState {
  tableWithSessions: ResponseTableWithSessions;
  orderItems: OrderItemWithSummarizedOrder[];
  totalPrice: number;
  editingItem: OrderItemWithSummarizedOrder | null;
  isEditingFinalizedOrder: boolean;
  rowSelection: Record<string, boolean>;
}

// Actions
export interface OrderDetailActions {
  setEditingItem: (item: OrderItemWithSummarizedOrder | null) => void;
  setRowSelection: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  updateEditingQuantity: (delta: number) => void;
  resetSelection: () => void;
  updateOrderItem: () => Promise<void>;
  removeOrderItem: () => Promise<void>;
}

// Meta
export interface OrderDetailMeta {
  storeId: string;
  tableId: string;
  isRefetching: boolean;
}

// Context Value
export interface OrderDetailContextValue {
  state: OrderDetailState;
  actions: OrderDetailActions;
  meta: OrderDetailMeta;
}

export const OrderDetailContext = createContext<OrderDetailContextValue | null>(
  null
);

export function useOrderDetailContext() {
  const context = useContext(OrderDetailContext);
  if (!context) {
    throw new Error(
      "useOrderDetailContext must be used within a OrderDetailProvider"
    );
  }
  return context;
}

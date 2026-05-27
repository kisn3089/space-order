"use client";

import { useRealtimeConnectionStatus } from "@/lib/realtime/useRealtimeConnectionStatus";

const MESSAGE_BY_STATUS = {
  connecting: "실시간 연결 끊김 · 자동 재연결 중…",
  disconnected: "실시간 연결 끊김 · 자동 재연결 중…",
  failed: "실시간 연결 실패. 페이지를 새로고침해 주세요.",
} as const;

const STYLE_BY_STATUS = {
  connecting: "bg-amber-100 text-amber-900 border-amber-200",
  disconnected: "bg-amber-100 text-amber-900 border-amber-200",
  failed: "bg-red-100 text-red-900 border-red-200",
} as const;

export default function RealtimeStatusBanner() {
  const status = useRealtimeConnectionStatus();
  if (status === "connected") return null;

  return (
    <div
      role="status"
      className={`w-full text-center font-semibold text-xs py-1.5 border-b ${STYLE_BY_STATUS[status]}`}
    >
      {MESSAGE_BY_STATUS[status]}
    </div>
  );
}

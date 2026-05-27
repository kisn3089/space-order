"use client";

import { useRealtimeConnectionStatus } from "@/lib/realtime/useRealtimeConnectionStatus";

const COLOR_BY_STATUS = {
  connected: "bg-emerald-500",
  connecting: "bg-amber-400 animate-pulse",
  disconnected: "bg-zinc-400",
  failed: "bg-red-500",
} as const;

const LABEL_BY_STATUS = {
  connected: "실시간 연결됨",
  connecting: "재연결 시도 중",
  disconnected: "연결 끊김",
  failed: "연결 실패",
} as const;

export default function RealtimeStatusDot() {
  const status = useRealtimeConnectionStatus();

  return (
    <div
      className="flex items-center justify-center gap-1.5 px-2 py-1 text-xs text-muted-foreground"
      title={LABEL_BY_STATUS[status]}
      aria-label={LABEL_BY_STATUS[status]}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${COLOR_BY_STATUS[status]}`}
      />
      <span className="group-data-[collapsible=icon]:hidden whitespace-pre">
        {LABEL_BY_STATUS[status]}
      </span>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useGlobalTimer } from "./GlobalTimerContext";
import {
  formatTime,
  isWithinThreshold,
} from "@spaceorder/ui/utils/formatSessionTime";

export default function SessionExpireTime({
  expiresAt,
}: {
  expiresAt: Date | undefined;
}) {
  const currentTime = useGlobalTimer();

  const remainingMinutes: string | number = useMemo(() => {
    if (!expiresAt) return "";

    const expiryTime = new Date(expiresAt).getTime();
    const timeDiff = expiryTime - currentTime;

    if (timeDiff < 0) return "만료";

    return Math.ceil(timeDiff / (1000 * 60));
  }, [expiresAt, currentTime]);

  const isExpiringSoon =
    typeof remainingMinutes === "number"
      ? isWithinThreshold(remainingMinutes, 20)
      : true;

  return (
    <p
      className={`w-full text-center font-semibold text-sm ${isExpiringSoon ? "text-destructive" : ""}`}
    >
      {formatTime(remainingMinutes)}
    </p>
  );
}

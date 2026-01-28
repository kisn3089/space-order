function padZero(num: number): string {
  return num.toString().padStart(2, "0");
}

export function formatTime(minutes: string | number): string {
  if (typeof minutes === "string") {
    return minutes;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${padZero(hours)}:${padZero(mins)}`;
}

/**
 * @param minutes number 남은 시간 (분)
 * @param thresholdMinutes number 임계값 시간 (분)
 * @returns boolean 남은 시간이 임계값 이하인지 여부
 */
export function isWithinThreshold(
  minutes: number,
  thresholdMinutes: number
): boolean {
  return minutes <= thresholdMinutes;
}

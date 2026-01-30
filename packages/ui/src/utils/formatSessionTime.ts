function make2digit(minutes: number): string {
  return new Intl.NumberFormat("ko-KR", { minimumIntegerDigits: 2 }).format(
    minutes
  );
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${make2digit(hours)}:${make2digit(mins)}`;
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

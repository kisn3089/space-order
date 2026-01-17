export default function SessionExpireTime({
  expiresAt,
}: {
  expiresAt: Date | undefined;
}) {
  const sessionExpireAt = expiresAt
    ? new Date(expiresAt).toLocaleTimeString("Ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";

  return (
    <p className="w-full text-center font-semibold text-sm">
      {sessionExpireAt}
    </p>
  );
}

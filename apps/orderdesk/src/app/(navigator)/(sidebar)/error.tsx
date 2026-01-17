"use client";

import { useAuthInfo } from "@spaceorder/auth";
import { Button } from "@spaceorder/ui/components/button";

export default function NavigatorError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { signOut } = useAuthInfo();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-2">
      <h2 className="text-xl font-semibold">오류가 발생했습니다.</h2>
      <p className="text-muted-foreground">
        다시 시도해도 안되면 로그아웃 후 이용해주세요.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>다시 시도</Button>
        <Button onClick={signOut} variant={"secondary"}>
          로그아웃
        </Button>
      </div>
    </div>
  );
}

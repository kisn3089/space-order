import { useAuthInfo } from "@spaceorder/auth";
import { Button } from "@spaceorder/ui/components/button";

export default function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error & { digest?: string };
  resetErrorBoundary: () => void;
}) {
  const { signOut } = useAuthInfo();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-2">
      <h2 className="text-xl font-semibold">오류가 발생했습니다.</h2>
      <p className="text-muted-foreground">
        {error.message || "알 수 없는 오류가 발생했습니다."}
      </p>
      <div className="flex gap-4">
        <Button onClick={resetErrorBoundary}>다시 시도</Button>
        <Button onClick={signOut} variant={"secondary"}>
          로그아웃
        </Button>
      </div>
    </div>
  );
}

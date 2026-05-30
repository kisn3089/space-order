import { Button } from "@spaceorder/ui/components/button";
import { CircleAlert } from "lucide-react";

type ErrorFallbackViewProps = {
  errorTitle: string;
  reset?: () => void;
  children?: React.ReactNode;
};

export default function ErrorFallbackView({
  errorTitle,
  children,
  reset,
}: ErrorFallbackViewProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 text-center break-keep">
      <CircleAlert className="w-16 h-16 text-destructive mb-4" />
      <h1 className="md:text-lg font-bold">{errorTitle}</h1>
      {children && <div className="mt-4">{children}</div>}
      {reset && (
        <Button onClick={reset} className="font-semibold mt-4">
          다시 시도하기
        </Button>
      )}
    </div>
  );
}

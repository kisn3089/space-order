import { Button } from "@spaceorder/ui/components/button";

export default function TableErrorFallback() {
  return (
    <div className="absolute top-[50%] transform-3d -translate-y-[50%]">
      <div className="flex flex-col gap-2 p-2">
        <p className="font-semibold">주문 정보 요청 중 오류가 발생했습니다.</p>
        <Button id="retry" className="w-full">
          다시 시도
        </Button>
      </div>
    </div>
  );
}

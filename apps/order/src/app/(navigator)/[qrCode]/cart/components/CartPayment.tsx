import { Button } from "@spaceorder/ui/components/button";

export default function CartPayment() {
  return (
    <section className="p-4 bg-white">
      <h3 className="font-bold text-lg">결제 상세</h3>
      <div className="p-3 flex flex-col font-semibold divide-y-2 divide-black">
        <div className="flex justify-between py-2">
          <p>주문 금액</p>
          <p>12,000원</p>
        </div>
        <div className="flex justify-between text-lg py-2">
          <p>총 결제 금액</p>
          {/* TODO: API 연동된 금액으로 변경 필요 */}
          <p className="text-orange-700">12,000원</p>
        </div>
      </div>
      <Button
        // onClick={() => console.log("주문 생성: ", MOCK_ORDER_ITEMS)}
        className="w-full h-12 font-bold"
      >
        주문 하기
      </Button>
    </section>
  );
}

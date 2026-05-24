import { useMenuDetailContext } from "./MenuDetailContext";
import RequestButton from "@/app/stores/[storeId]/(navigator)/common/RequestButton";

export default function MenuDetailAddCart() {
  const {
    state: { menu },
    meta: { price, addCartMutate },
    actions: { addCart },
  } = useMenuDetailContext();

  if (addCartMutate.failureReason) {
    throw addCartMutate.failureReason;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto">
      <footer className="bg-white border-t border-border p-4">
        <RequestButton
          mutate={addCartMutate}
          message={{
            disabled: "현재 주문이 불가능한 메뉴입니다.",
            error: `${price.toLocaleString("ko-KR")}원 - 장바구니 다시 담기`,
            loading: "장바구니에 추가 중...",
          }}
          className="w-full h-12 font-bold tracking-wide rounded-3xl"
          onClick={addCart}
          disabled={!menu.isAvailable || addCartMutate.isPending}
        >
          {`${price.toLocaleString("ko-KR")}원 - 장바구니 담기`}
        </RequestButton>
      </footer>
    </div>
  );
}

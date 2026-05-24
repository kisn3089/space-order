import { use } from "react";
import MoveMenusPageButton from "../components/MoveMenusPageButton";
import SectionCardView from "../components/SectionCardView";
import OrderHistory from "../components/order-history/OrderHistory";
import StoreOrdersQueue from "../components/store-orders-queue/StoreOrdersQueue";

export default function StorePage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId: _ } = use(params);

  return (
    <div className="min-h-[calc(100vh-48px)] p-2">
      <h1 className="font-bold text-xl p-2 mb-2 text-center whitespace-pre-line leading-[1.4] bg-linear-to-r from-teal-500 from-25% to-indigo-600 to-75% text-transparent bg-clip-text">
        {`지금 주문하면 
        즉시 조리됩니다!`}
      </h1>
      <div className="flex flex-col gap-y-4">
        <SectionCardView title="매장 주문 대기열">
          <StoreOrdersQueue />
        </SectionCardView>
        <SectionCardView title="내 주문 내역">
          <OrderHistory />
        </SectionCardView>
      </div>
      <section className="flex items-center py-6">
        <MoveMenusPageButton />
      </section>
    </div>
  );
}

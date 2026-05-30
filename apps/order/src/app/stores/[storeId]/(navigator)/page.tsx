import MoveMenusPageButton from "../components/MoveMenusPageButton";
import SectionCardView from "../components/SectionCardView";
import OrderHistory from "../components/order-history/OrderHistory";
import StoreOrdersQueue from "../components/store-orders-queue/StoreOrdersQueue";
import NoticeTitle from "./components/NoticeTitle";

export default function StorePage() {
  return (
    <div className="min-h-[calc(100vh-48px)] p-2">
      <NoticeTitle />
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

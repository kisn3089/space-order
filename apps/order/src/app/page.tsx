import PostmanGuide from "@/components/PostmanGuide";
import { Card, CardHeader, CardTitle } from "@spaceorder/ui/components/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 h-dvh p-4">
      <Card className="w-full">
        <CardHeader className="p-6">
          <CardTitle className="font-bold text-xl">
            {"테이블의 QR 코드를 스캔해주세요!"}
          </CardTitle>
          <PostmanGuide />
        </CardHeader>
      </Card>
    </div>
  );
}

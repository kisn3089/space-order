import PostmanGuide from "@/components/PostmanGuide";
import { Card, CardHeader, CardTitle } from "@spaceorder/ui/components/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 h-full p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <CardTitle className="font-bold text-xl">
            {"테이블의 QR 코드를 스캔해주세요!"}
          </CardTitle>
        </CardHeader>
        <PostmanGuide />
      </Card>
    </div>
  );
}

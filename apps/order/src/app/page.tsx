import { Button } from "@spaceorder/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@spaceorder/ui/components/card";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8 h-screen">
      <Card className="w-full max-w-fit min-w-sm">
        <CardHeader className="p-8">
          <CardTitle className="flex justify-center font-bold">
            {"고객이 주문하는 애플리케이션 서비스입니다."}
          </CardTitle>
          <CardContent className="p-0 mt-2">
            {"현재 구현 중입니다. Postman으로 API를 호출해주세요!"}
          </CardContent>
          <Button asChild className="w-full mt-2">
            <a
              href="https://github.com/kisn3089/space-order/releases/tag/v1.0.0"
              target="_blank"
              rel="noopener noreferrer"
            >
              Postman Collection 다운로드
            </a>
          </Button>
        </CardHeader>
      </Card>
    </div>
  );
}

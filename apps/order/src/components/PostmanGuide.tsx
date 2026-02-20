import { Button } from "@spaceorder/ui/components/button";
import { CardContent, CardDescription } from "@spaceorder/ui/components/card";

export default function PostmanGuide() {
  return (
    <CardContent>
      <CardDescription className="whitespace-pre font-semibold text-sm">
        {`현재는 구현 단계입니다. \nPostman으로 API를 이용해보세요!`}
      </CardDescription>
      <Button asChild className="w-full mt-4 h-12 font-bold">
        <a
          href="https://github.com/kisn3089/space-order/releases/tag/v1.0.0"
          target="_blank"
          rel="noopener noreferrer"
        >
          Postman Collection 다운로드
        </a>
      </Button>
    </CardContent>
  );
}

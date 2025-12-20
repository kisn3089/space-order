import { Card, CardHeader, CardTitle } from "@spaceorder/ui/components/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Card className="w-full max-w-md min-w-sm">
        <CardHeader className="p-8">
          <CardTitle className="flex justify-center font-bold">
            DASHBOARD PAGE!
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

import { Card, CardHeader, CardTitle } from "@spaceorder/ui/components/card";
import FormCard from "./components/formCard/FormCard";
// import AdminInfo from "./components/server/Admins";
// import MotionTabs from "./components/motionTabs/MotionTabs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Card className="w-full max-w-md min-w-sm">
        <CardHeader className="p-8">
          <CardTitle className="flex justify-center font-bold">
            SPACEORDER
          </CardTitle>
        </CardHeader>
        <FormCard />
        {/* <AdminInfo>
        </AdminInfo> */}
      </Card>
    </div>
  );
}

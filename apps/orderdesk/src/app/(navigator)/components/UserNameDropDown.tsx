import { SidebarMenuButton } from "@spaceorder/ui/components/sidebar";
import UserInfoDropdown from "../(sidebar)/components/UserInfoDropdown";
import { CircleUser } from "lucide-react";
import UserName from "../(sidebar)/components/UserName";
import { Suspense } from "react";
import { Spinner } from "@spaceorder/ui/components/spinner";

export default function UserNameDropDown() {
  return (
    <UserInfoDropdown>
      <SidebarMenuButton variant={"outline"}>
        <CircleUser />
        <Suspense
          fallback={
            <div className="w-full grid place-content-center">
              <Spinner />
            </div>
          }
        >
          <UserName />
        </Suspense>
      </SidebarMenuButton>
    </UserInfoDropdown>
  );
}

import { SidebarMenuButton } from "@spaceorder/ui/components/sidebar";
import UserInfoDropdown from "../(sidebar)/components/UserInfoDropdown";
import { CircleUser } from "lucide-react";
import UserName from "../(sidebar)/components/UserName";

export default function UserNameDropDown() {
  return (
    <UserInfoDropdown>
      <SidebarMenuButton variant={"outline"}>
        <CircleUser />
        <UserName />
      </SidebarMenuButton>
    </UserInfoDropdown>
  );
}

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@spaceorder/ui/components/sidebar";
import UserInfoDropdown from "../(sidebar)/components/UserInfoDropdown";
import { CircleUser } from "lucide-react";
import UserName from "../(sidebar)/components/UserName";

export default function NavSidebarFooter() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem key={"userName"}>
          <UserInfoDropdown>
            <SidebarMenuButton variant={"outline"}>
              <CircleUser />
              <UserName />
            </SidebarMenuButton>
          </UserInfoDropdown>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

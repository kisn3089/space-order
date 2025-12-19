import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@spaceorder/ui/components/sidebar";
import UserInfoDropdown from "./UserInfoDropdown";
import { CircleUser } from "lucide-react";
import UserName from "./UserName";

export default function NavSidebarFooter() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem key={"userName"}>
          <UserInfoDropdown>
            <SidebarMenuButton>
              <CircleUser />
              <UserName />
            </SidebarMenuButton>
          </UserInfoDropdown>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

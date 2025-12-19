"use client";

import { sidebarList } from "@/shared/config/sidebarList";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@spaceorder/ui/components/sidebar";
import NavSidebarFooter from "../../components/NavSidebarFooter";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="whitespace-nowrap">
            주문 관리
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarList.map((sidebarElement) => (
                <SidebarMenuItem key={sidebarElement.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.includes(sidebarElement.url)}
                  >
                    <Link href={sidebarElement.url}>
                      <sidebarElement.icon />
                      <span>{sidebarElement.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <NavSidebarFooter />
    </Sidebar>
  );
}

import {
  SidebarGroupLabel,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@spaceorder/ui/components/sidebar";
import AuthGuard from "@/providers/AuthGuard";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@spaceorder/ui/components/sidebar";

import Link from "next/link";
import { cookies } from "next/headers";
import NavSidebarFooter from "../components/NavSidebarFooter";
import { sidebarList } from "@/shared/config/sidebarList";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <section className="antialiased">
      <AuthGuard>
        <SidebarProvider defaultOpen={defaultOpen}>
          <NavSidebar />
          <main className="w-full">{children}</main>
        </SidebarProvider>
      </AuthGuard>
    </section>
  );
}

function NavSidebar() {
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
                  <SidebarMenuButton asChild>
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

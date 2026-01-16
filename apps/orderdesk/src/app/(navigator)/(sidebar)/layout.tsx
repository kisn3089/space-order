import { SidebarProvider } from "@spaceorder/ui/components/sidebar";
import { cookies } from "next/headers";
import NavSidebar from "./components/NavSidebar";
import AuthGuard from "@/providers/AuthGuard";
import ServerPrefetch from "@/providers/ServerPrefetch";

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
        <ServerPrefetch url="/me">
          <SidebarProvider defaultOpen={defaultOpen}>
            <NavSidebar />
            <main className="w-full">{children}</main>
          </SidebarProvider>
        </ServerPrefetch>
      </AuthGuard>
    </section>
  );
}

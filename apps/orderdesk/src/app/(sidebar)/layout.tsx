import {
  SidebarProvider,
  SidebarTrigger,
} from "@spaceorder/ui/components/sidebar";
import { NavSidebar } from "./page";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="antialiased">
      <SidebarProvider>
        <NavSidebar />
        <main>
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
      {/* {children} */}
    </section>
  );
}

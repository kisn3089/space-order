import {
  SidebarProvider,
  SidebarTrigger,
} from "@spaceorder/ui/components/sidebar";
import { NavSidebar } from "./page";
import axiosInterceptor from "@/lib/axios/interceptor";

// [TODO:] 커밋 전에 반드시 제거!!
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWl2anFrdjgwMDAzdWRvdzFkaHZzcjNmIiwiaWF0IjoxNzY1NDQyNTIwLCJleHAiOjE3NjU0NDYxMjB9.XJAndec0oow-kxg2s16fPvkXmtTOJlXu0jRsTHjwPwk";

export default function SidebarLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  axiosInterceptor(token);
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

"use client";

import AuthenticationProvider from "@spaceorder/auth/providers/AuthenticationProvider";
import { COOKIE_TABLE } from "@spaceorder/db/constants";
import { useRouter } from "next/navigation";
import { deleteCookie } from "cookies-next";
import AxiosInterceptor from "@/lib/AxiosInterceptor";

export function OrderdeskAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const signOut = () => {
    deleteCookie(COOKIE_TABLE.ACCESS_TOKEN);
    deleteCookie(COOKIE_TABLE.REFRESH);
    router.push("/signin");
  };

  return (
    <AuthenticationProvider clientSignOut={signOut}>
      <AxiosInterceptor>{children}</AxiosInterceptor>
    </AuthenticationProvider>
  );
}

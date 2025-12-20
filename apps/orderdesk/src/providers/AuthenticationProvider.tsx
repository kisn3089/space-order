"use client";

import clearCookie from "@/app/common/servers/cookies";
import { AccessToken } from "@spaceorder/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";

type AuthInfo = AccessToken;
const defaultAuth: AuthInfo = {
  accessToken: "",
  expiresAt: new Date(),
};

type AuthInfoContextType = {
  authInfo: AuthInfo;
  setAuthInfo: React.Dispatch<React.SetStateAction<AuthInfo>>;
  signOut: () => Promise<void>;
};
const authInfoInitialValue: AuthInfoContextType = {
  authInfo: defaultAuth,
  setAuthInfo: () => {},
  signOut: async () => {},
};

const AuthInfoContext =
  React.createContext<typeof authInfoInitialValue>(authInfoInitialValue);

export default function AuthenticationProvider({
  children,
}: React.PropsWithChildren) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [authInfo, setAuthInfo] = React.useState<AuthInfo>(defaultAuth);

  const signOut = React.useCallback(async () => {
    setAuthInfo(defaultAuth);
    queryClient.clear();
    await clearCookie("Refresh");
    router.push("/signin");
  }, [queryClient, router]);

  return (
    <AuthInfoContext.Provider value={{ authInfo, setAuthInfo, signOut }}>
      {children}
    </AuthInfoContext.Provider>
  );
}

export function useAuthInfo() {
  return React.useContext(AuthInfoContext);
}

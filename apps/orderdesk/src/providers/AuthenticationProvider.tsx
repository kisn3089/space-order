"use client";

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
  logout: () => void;
};
const authInfoInitialValue: AuthInfoContextType = {
  authInfo: defaultAuth,
  setAuthInfo: () => {},
  logout: () => {},
};

const AuthInfoContext =
  React.createContext<typeof authInfoInitialValue>(authInfoInitialValue);

export default function AuthenticationProvider({
  children,
}: React.PropsWithChildren) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [authInfo, setAuthInfo] = React.useState<AuthInfo>(defaultAuth);

  const logout = React.useCallback(() => {
    queryClient.clear();
    setAuthInfo(defaultAuth);
    router.push("/signin");
  }, []);

  return (
    <AuthInfoContext.Provider value={{ authInfo, setAuthInfo, logout }}>
      {children}
    </AuthInfoContext.Provider>
  );
}

export function useAuthInfo() {
  return React.useContext(AuthInfoContext);
}

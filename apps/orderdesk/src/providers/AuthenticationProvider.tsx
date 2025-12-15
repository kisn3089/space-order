"use client";

import { AccessToken } from "@spaceorder/api";
import React from "react";

type AuthInfo = AccessToken;
const defaultAuth: AuthInfo = {
  accessToken: "",
  expiresAt: new Date(),
};

type AuthInfoContextType = {
  authInfo: AuthInfo;
  setAuthInfo: React.Dispatch<React.SetStateAction<AuthInfo>>;
  clear: () => void;
};
const authInfoInitialValue: AuthInfoContextType = {
  authInfo: defaultAuth,
  setAuthInfo: () => {},
  clear: () => {},
};

const AuthInfoContext =
  React.createContext<typeof authInfoInitialValue>(authInfoInitialValue);

export default function AuthenticationProvider({
  children,
}: React.PropsWithChildren) {
  const [authInfo, setAuthInfo] = React.useState<AuthInfo>(defaultAuth);
  const clear = () => {
    // queryClient.clear()
    setAuthInfo(defaultAuth);
  };

  return (
    <AuthInfoContext.Provider value={{ authInfo, setAuthInfo, clear }}>
      {children}
    </AuthInfoContext.Provider>
  );
}

export function useAuthInfo() {
  return React.useContext(AuthInfoContext);
}

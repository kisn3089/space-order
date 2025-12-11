"use client";

import { AccessToken } from "@spaceorder/api";
import UserInfoProvider from "./UserInfoProvider";
import React from "react";

type AuthInfo = AccessToken;
const defaultAuth: AuthInfo = {
  accessToken: "",
  expiresAt: new Date(),
};

type AuthInfoContextType = {
  authInfo: AuthInfo;
  setAuthInfo: React.Dispatch<React.SetStateAction<AuthInfo>>;
};
const authInfoInitialValue: AuthInfoContextType = {
  authInfo: defaultAuth,
  setAuthInfo: () => {},
};

const AuthInfoContext =
  React.createContext<typeof authInfoInitialValue>(authInfoInitialValue);

export default function AuthenticationProvider({
  children,
}: React.PropsWithChildren) {
  const [authInfo, setAuthInfo] = React.useState<AuthInfo>(defaultAuth);

  return (
    <AuthInfoContext.Provider value={{ authInfo, setAuthInfo }}>
      <UserInfoProvider>{children}</UserInfoProvider>
    </AuthInfoContext.Provider>
  );
}

export function useAuthInfo() {
  return React.useContext(AuthInfoContext);
}

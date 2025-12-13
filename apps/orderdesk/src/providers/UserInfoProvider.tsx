"use client";

import { PlainOwner } from "@spaceorder/db";
import React from "react";

type UserInfo = Omit<PlainOwner, "lastLoginAt" | "updatedAt" | "createdAt">;
const defaultUser: UserInfo = {
  publicId: "",
  email: "",
  businessNumber: "",
  name: "",
  isActive: false,
  phone: "",
  role: "owner",
  // [TODO:] roles: [], responsibility: owner 추가
  // auth: { accessToken: "", expiresAt: new Date() },
};

type UserInfoContextType = {
  userInfo: UserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<UserInfo>>;
};
const userInfoInitialValue: UserInfoContextType = {
  userInfo: defaultUser,
  setUserInfo: () => {},
};

const UserInfoContext =
  React.createContext<typeof userInfoInitialValue>(userInfoInitialValue);

export default function UserInfoProvider({
  children,
}: React.PropsWithChildren) {
  const [userInfo, setUserInfo] = React.useState<UserInfo>(defaultUser);

  return (
    <UserInfoContext.Provider value={{ userInfo, setUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
}

export function useUserInfo() {
  return React.useContext(UserInfoContext);
}

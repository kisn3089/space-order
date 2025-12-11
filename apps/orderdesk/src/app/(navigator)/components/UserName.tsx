"use client";

import { useUserInfo } from "@/providers/UserInfoProvider";

export default function UserName() {
  const { userInfo } = useUserInfo();

  return <h3>{userInfo.name ?? "User"}</h3>;
}

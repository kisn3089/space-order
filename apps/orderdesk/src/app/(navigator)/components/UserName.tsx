"use client";

import { useAuthInfo } from "@/providers/AuthenticationProvider";
import { meQuery } from "@spaceorder/api";

export default function UserName() {
  const { authInfo } = useAuthInfo();
  const isReadyFetch = Boolean(authInfo.accessToken);

  const { data, isSuccess } = meQuery.findMe({
    enabled: isReadyFetch,
  });

  if (!isReadyFetch || !isSuccess) {
    return null;
  }

  return <h3>{data.name}</h3>;
}

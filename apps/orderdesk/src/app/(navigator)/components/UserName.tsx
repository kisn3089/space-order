"use client";

import { useUserInfo } from "@/providers/UserInfoProvider";
import { meQuery } from "@spaceorder/api";
import { useState } from "react";

const accessToken = "";
export default function UserName() {
  const [cnt, setCnt] = useState(0);
  // const { userInfo } = useUserInfo();
  const { data, refetch, error } = meQuery.findMe({
    queryOptions: {
      queryKey: [`${cnt}-me`],
    },
    accessToken,
  });

  const click = async () => {
    setCnt((prev) => prev + 1);
    await refetch();
  };

  console.log("data: ", data);
  console.log("error: ", error);

  return <h3 onClick={click}>{data?.name ?? "User"}</h3>;
}

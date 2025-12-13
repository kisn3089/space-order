"use client";

import { useUserInfo } from "@/providers/UserInfoProvider";
import { meQuery, ownersQuery } from "@spaceorder/api";
import { useState } from "react";

const expriedAccessToekn = "";
export default function UserName() {
  const [cnt, setCnt] = useState(0);
  // const { userInfo } = useUserInfo();
  const { data, refetch, error, isSuccess } = meQuery.findMe({
    queryOptions: {
      queryKey: [`${cnt}-me`],
    },
    accessToken: expriedAccessToekn,
  });

  // const { data: ownersData } = ownersQuery.findAll({ enabled: isSuccess });
  // console.log("ownersData: ", ownersData);

  const click = async () => {
    setCnt((prev) => prev + 1);
    await refetch();
  };

  console.log("data: ", data);
  console.log("error: ", error);

  return <h3 onClick={click}>{data?.name ?? "User"}</h3>;
}

"use client";

import { meQuery } from "@spaceorder/api";
import { ownersQuery } from "@spaceorder/api/core/owners/owners.query";

export function UserInfo() {
  const { data, error, refetch } = ownersQuery.fetchOwnerList({
    enabled: false,
  });
  // const { data, error } = meQuery.fetchMyOrderListAllinclusive({});

  console.log("owners data: ", data);
  console.log("owners error: ", error);

  return <div onClick={() => refetch()}>UserInfo</div>;
}

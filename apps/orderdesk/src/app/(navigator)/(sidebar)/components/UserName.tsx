"use client";

import { meQuery } from "@spaceorder/api";

export default function UserName() {
  const { data: ownerInfo, isSuccess } = meQuery.findMe({});

  if (!isSuccess) return null;

  return <span>{ownerInfo.name}</span>;
}

"use client";

import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { ResponseOwner } from "@spaceorder/db";

export default function UserName() {
  const { data } = useSuspenseWithAuth<ResponseOwner>(`/me`);

  return <span>{data.name}</span>;
}

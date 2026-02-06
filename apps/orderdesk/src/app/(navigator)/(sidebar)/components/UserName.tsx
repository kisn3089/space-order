"use client";

import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { PublicOwner } from "@spaceorder/db/types";

export default function UserName() {
  const { data } = useSuspenseWithAuth<PublicOwner>(`/me`);

  return <span>{data.name}</span>;
}

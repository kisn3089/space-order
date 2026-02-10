"use client";

import useSuspenseWithAuth from "@spaceorder/api/hooks/useSuspenseWithAuth";
import { PublicOwner } from "@spaceorder/db/types";

export default function UserName() {
  const { data } = useSuspenseWithAuth<PublicOwner>(`/identity/v1/me`);

  return <span>{data.name}</span>;
}

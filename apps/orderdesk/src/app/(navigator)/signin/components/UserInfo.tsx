"use client";

import { ownersQuery } from "@spaceorder/api/core/owners/owners.query";

export function UserInfo() {
  const { data, error } = ownersQuery.findAll({});

  console.log("owners data: ", data);
  console.log("owners error: ", error);

  return <div></div>;
}

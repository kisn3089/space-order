"use client";

import { useAuthInfo } from "@/providers/AuthenticationProvider";
import { meQuery } from "@spaceorder/api";

export default function SidebarFetch() {
  const { logout } = useAuthInfo();
  const { data, isSuccess, refetch } = meQuery.findMe({
    enabled: false,
  });

  const fetchUser = async () => {
    await refetch();
  };

  if (isSuccess) {
    return (
      <div>
        <h3 onClick={fetchUser}>{data.name}</h3>
        <h3 onClick={logout}>logout</h3>
      </div>
    );
  }

  return <div onClick={fetchUser}>Fetch</div>;
}

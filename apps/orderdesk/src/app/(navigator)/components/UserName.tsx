import { getAccessToken } from "@/lib/server/getAccessToken";
import UserInfoDropdown from "./UserInfoDropdown";
import { QueryClient } from "@tanstack/react-query";
import { httpMe } from "@spaceorder/api";
import { PlainOwner } from "@spaceorder/db";
import { Button } from "@spaceorder/ui/components/button";

export default async function UserName() {
  const queryClient = new QueryClient();
  const accessToken = await getAccessToken();

  if (accessToken) {
    await queryClient.prefetchQuery({
      queryKey: ["me"],
      queryFn: () => httpMe.me(accessToken),
    });
  }
  const user = queryClient.getQueryData<PlainOwner>(["me"]);

  if (!user) return <div>no user</div>;

  return (
    <UserInfoDropdown>
      <Button size={"sm"} variant={"outline"}>
        {user.name}
      </Button>
    </UserInfoDropdown>
  );
}

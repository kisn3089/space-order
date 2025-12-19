"use client";

import { useAuthInfo } from "@/providers/AuthenticationProvider";
import { meQuery } from "@spaceorder/api";
import { Button } from "@spaceorder/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@spaceorder/ui/components/dropdown-menu";

export default function UserName() {
  const { authInfo } = useAuthInfo();
  const isReadyFetch = Boolean(authInfo.accessToken);

  const { data, isSuccess } = meQuery.findMe({
    enabled: isReadyFetch,
  });

  if (!isReadyFetch || !isSuccess) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"}>{data.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            Keyboard shortcuts
            <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

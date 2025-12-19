"use client";

import { useAuthInfo } from "@/providers/AuthenticationProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@spaceorder/ui/components/dropdown-menu";
import { PropsWithChildren } from "react";

export default function UserInfoDropdown({ children }: PropsWithChildren) {
  const { signOut } = useAuthInfo();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-42  " align="start">
        <DropdownMenuLabel>내 정보</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={signOut}>
            로그아웃
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

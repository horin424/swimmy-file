"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setMockSession, useSession } from "@/lib/session";
import { initials } from "@/lib/utils";

export function AccountMenu() {
  const { status, user } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (status === "guest") {
    return (
      <div className="flex items-center gap-2">
        <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" size="sm">
          Log in
        </Button>
        <Button render={<Link href="/signup" />} nativeButton={false} size="sm">
          Sign up
        </Button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="rounded-full outline-none ring-primary/50 focus-visible:ring-2"
      >
        <Avatar className="h-8 w-8 border border-border">
          <AvatarFallback className="bg-secondary text-xs">{initials(user.handle)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          {!user.emailVerified && (
            <p className="px-1.5 pb-1 text-xs text-warning">Email verification required</p>
          )}
          <DropdownMenuItem render={<Link href="/me" />}>Dashboard</DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/me/settings" />}>Settings</DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/support" />}>Support</DropdownMenuItem>
          {user.role === "ADMIN" && (
            <DropdownMenuItem render={<Link href="/admin" />}>Admin</DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            setMockSession({ status: "guest", user: null });
            toast("Signed out");
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

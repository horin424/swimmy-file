import { Suspense } from "react";
import Link from "next/link";
import { Bell, Search, Upload as UploadIcon } from "lucide-react";
import { Logo } from "./logo";
import { HeaderSearchForm } from "./header-search-form";
import { Input } from "@/components/ui/input";
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

function SearchFormFallback() {
  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        disabled
        placeholder="Search videos, tags, categories..."
        aria-label="Search videos, tags, categories"
        className="h-9 rounded-full border-border bg-accent pl-9"
      />
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <Link href="/" className="hidden shrink-0 md:flex">
        <Logo />
      </Link>

      <Suspense fallback={<SearchFormFallback />}>
        <HeaderSearchForm />
      </Suspense>

      <div className="ml-auto flex items-center gap-2">
        <Button
          render={<Link href="/upload" />}
          nativeButton={false}
          size="sm"
          className="hidden gap-1.5 bg-gradient-brand text-white hover:opacity-90 sm:flex"
        >
          <UploadIcon className="h-4 w-4" />
          Upload
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative rounded-full text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Account menu"
            className="rounded-full outline-none ring-primary/50 focus-visible:ring-2"
          >
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-secondary text-xs">DU</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>demo.user@swimmyfile.io</DropdownMenuLabel>
              <DropdownMenuItem render={<Link href="/me" />}>My Page</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/me?tab=settings" />}>Settings</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/contact" />}>Contact</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/login" />}>Log in</DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/signup" />}>Sign up</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" render={<Link href="/login" />}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

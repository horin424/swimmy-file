import { Suspense } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Logo } from "./logo";
import { HeaderSearchForm } from "./header-search-form";
import { AccountMenu } from "./account-menu";
import { UploadButton } from "./upload-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
        <UploadButton />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative rounded-full text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive" />
        </Button>
        <AccountMenu />
      </div>
    </header>
  );
}

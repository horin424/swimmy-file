"use client";

import { useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function HeaderSearchForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // Uncontrolled on purpose: derived directly from the URL during render (no
  // effect needed to keep it in sync). The `key` below remounts the input —
  // resetting its internal value — only when the URL's query actually
  // changes, so free typing in between never fights with React state.
  const initialQuery = pathname === "/search" ? searchParams.get("q") ?? "" : "";

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const value = inputRef.current?.value.trim() ?? "";
        router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
      }}
      className="relative w-full max-w-md"
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        key={initialQuery}
        ref={inputRef}
        defaultValue={initialQuery}
        placeholder="Search videos, tags, categories..."
        aria-label="Search videos, tags, categories"
        className="h-9 rounded-full border-border bg-accent pl-9 focus-visible:border-primary/50"
      />
    </form>
  );
}

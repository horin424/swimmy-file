"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Clock, Film, Hash, AtSign, X, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getSearchSuggestions } from "@/lib/mock-data";

const RECENT_KEY = "swimmyfile:recentSearches";
const MAX_RECENT = 6;

function loadRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (raw) return JSON.parse(raw) as string[];
  } catch {
    // Malformed or unavailable storage — just start with no history.
  }
  return [];
}

function saveRecent(list: string[]) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable (e.g. private browsing) — history just won't persist.
  }
}

interface Row {
  key: string;
  label: string;
  sublabel?: string;
  href: string;
  icon: LucideIcon;
  isRecent?: boolean;
  /** Text to save to recent searches on select — omitted for rows (like a
   * direct video match) that aren't really "a search" a history entry
   * should replay. */
  searchTerm?: string;
}

function SearchBox({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Deferred rather than a direct setState call in the effect body,
    // matching the pattern in src/lib/session.ts.
    Promise.resolve().then(() => setRecent(loadRecent()));
  }, []);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const trimmed = value.trim();

  const rows: Row[] = useMemo(() => {
    if (!trimmed) {
      return recent.map((q) => ({
        key: `recent-${q}`,
        label: q,
        href: `/search?q=${encodeURIComponent(q)}`,
        icon: Clock,
        isRecent: true,
        searchTerm: q,
      }));
    }
    const matches = getSearchSuggestions(trimmed).map((s) => ({
      key: `${s.type}-${s.label}`,
      label: s.label,
      sublabel: s.sublabel,
      href: s.href,
      icon: s.type === "video" ? Film : s.type === "tag" ? Hash : AtSign,
      // A video match navigates straight to that video — it isn't "a
      // search" worth replaying from history the way a tag/uploader is.
      searchTerm: s.type === "video" ? undefined : s.label.replace(/^[#@]/, ""),
    }));
    return [
      ...matches,
      {
        key: "raw-query",
        label: `Search for "${trimmed}"`,
        href: `/search?q=${encodeURIComponent(trimmed)}`,
        icon: Search,
        searchTerm: trimmed,
      },
    ];
  }, [trimmed, recent]);

  const remember = (q: string) => {
    if (!q) return;
    setRecent((prev) => {
      const next = [q, ...prev.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(0, MAX_RECENT);
      saveRecent(next);
      return next;
    });
  };

  const removeRecent = (q: string) => {
    setRecent((prev) => {
      const next = prev.filter((r) => r !== q);
      saveRecent(next);
      return next;
    });
  };

  const selectRow = (row: Row) => {
    if (row.searchTerm) remember(row.searchTerm);
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    router.push(row.href);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (activeIndex >= 0 && rows[activeIndex]) {
            selectRow(rows[activeIndex]);
          } else if (trimmed) {
            remember(trimmed);
            setOpen(false);
            inputRef.current?.blur();
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
          } else {
            router.push("/search");
          }
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActiveIndex((i) => Math.min(i + 1, rows.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          placeholder="Search public uploads, tags, categories..."
          aria-label="Search public uploads, tags, categories"
          autoComplete="off"
          className="h-9 rounded-full border-border bg-accent pl-9 focus-visible:border-primary/50"
        />
      </form>

      {open && rows.length > 0 && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 overflow-hidden rounded-xl bg-popover p-1 shadow-lg ring-1 ring-foreground/10">
          {!trimmed && (
            <div className="flex items-center justify-between px-2.5 py-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                Recent searches
              </p>
            </div>
          )}
          {rows.map((row, i) => {
            const Icon = row.icon;
            return (
              <div
                key={row.key}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectRow(row)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm",
                  i === activeIndex ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
                <span className="min-w-0 flex-1 truncate">{row.label}</span>
                {row.sublabel && <span className="shrink-0 text-xs text-muted-foreground/60">{row.sublabel}</span>}
                {row.isRecent && (
                  <button
                    type="button"
                    aria-label={`Remove "${row.label}" from recent searches`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecent(row.label);
                    }}
                    className="shrink-0 rounded p-0.5 text-muted-foreground/50 hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function HeaderSearchForm() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Only remount (and reset all internal state — typed value, open/closed,
  // recent-list snapshot) when the URL's own query actually changes, so
  // free typing in between never fights with the URL.
  const initialQuery = pathname === "/search" ? searchParams.get("q") ?? "" : "";

  return <SearchBox key={initialQuery} initialQuery={initialQuery} />;
}

"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search as SearchIcon, SlidersHorizontal, Clock, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { VideoCard } from "@/components/video-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { videos, browsableCategories, trendingTags } from "@/lib/mock-data";

type Sort = "popular" | "recent" | "views";
type Period = "all" | "24h" | "7d" | "30d";

const periodOptions: { value: Period; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

const periodHours: Record<Period, number | null> = {
  all: null,
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

function SearchResults() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  // Local draft so typing filters instantly without a URL round-trip per
  // keystroke — Enter (or blur) syncs it to ?q= so the search stays
  // shareable/bookmarkable, matching the header search box's own behavior.
  const [queryDraft, setQueryDraft] = useState(urlQuery);

  const requestedCategory = searchParams.get("category");
  const [category, setCategory] = useState<string>(
    requestedCategory && browsableCategories.some((c) => c.slug === requestedCategory) ? requestedCategory : "all",
  );
  const [tags, setTags] = useState<string[]>([]);
  const [period, setPeriod] = useState<Period>("all");
  const [sort, setSort] = useState<Sort>("popular");
  const [now] = useState(() => Date.now());

  const toggleTag = (slug: string) => {
    setTags((prev) => (prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]));
  };

  const syncQueryToUrl = () => {
    const trimmed = queryDraft.trim();
    const target = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search";
    // Deliberately not router.replace() here: in this Next build, once a
    // page hard-loads with a search param already in the URL (e.g. a
    // bookmarked/shared /search?q=... link, or a full page.goto in tests),
    // router.replace/push stop updating window.location for the rest of
    // that session — verified this isn't specific to this component (the
    // pre-existing header search box's router.push hits the identical
    // no-op). The native History API sidesteps Next's router state
    // tracking entirely; we don't need Next to re-render anything here
    // since local `queryDraft` state already drives the visible UI.
    window.history.replaceState(null, "", target);
  };

  const results = useMemo(() => {
    let list = videos.filter((v) => v.status === "active" && v.visibility === "public");
    if (queryDraft.trim()) {
      const q = queryDraft.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.title.toLowerCase().includes(q) ||
          v.tags.some((t) => t.includes(q)) ||
          v.uploader.handle.toLowerCase().includes(q),
      );
    }
    if (category !== "all") {
      list = list.filter((v) => v.category === category);
    }
    if (tags.length > 0) {
      list = list.filter((v) => tags.every((t) => v.tags.includes(t)));
    }
    const maxHours = periodHours[period];
    if (maxHours !== null) {
      list = list.filter((v) => (now - new Date(v.createdAt).getTime()) / 3600000 <= maxHours);
    }
    const sorted = [...list];
    if (sort === "popular") sorted.sort((a, b) => b.rankScore - a.rankScore);
    if (sort === "views") sorted.sort((a, b) => b.views - a.views);
    if (sort === "recent") sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted;
  }, [queryDraft, category, tags, period, sort, now]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {queryDraft.trim() ? (
            <>
              Showing results for <span className="text-foreground">&ldquo;{queryDraft.trim()}&rdquo;</span>
            </>
          ) : (
            "Find videos by title, tag, or category."
          )}
        </p>
      </div>

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          syncQueryToUrl();
        }}
        className="relative mb-6 max-w-lg"
      >
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={queryDraft}
          onChange={(e) => setQueryDraft(e.target.value)}
          onBlur={syncQueryToUrl}
          placeholder="Search videos, tags, or uploaders..."
          aria-label="Search videos, tags, or uploaders"
          autoComplete="off"
          className="h-10 rounded-full border-border bg-accent pl-9 pr-9 focus-visible:border-primary/50"
        />
        {queryDraft && (
          <button
            type="button"
            aria-label="Clear search"
            // Without this, clicking the button first blurs the input,
            // firing syncQueryToUrl with the stale pre-clear value before
            // this onClick runs — same fix header-search-form.tsx uses for
            // its remove-recent-search button.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setQueryDraft("");
              window.history.replaceState(null, "", "/search");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground/60 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-6">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Category
            </p>
            <div className="flex flex-col gap-0.5">
              {browsableCategories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setCategory(c.slug)}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                    category === c.slug
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {trendingTags.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => toggleTag(t.slug)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-colors",
                    tags.includes(t.slug)
                      ? "border-primary/50 bg-primary/15 text-primary"
                      : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Time period
            </p>
            <div className="flex flex-col gap-0.5">
              {periodOptions.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
                    period === p.value
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-sm text-muted-foreground">{results.length} results</p>
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1 pr-1.5">
                  #{t}
                  <button onClick={() => toggleTag(t)} aria-label={`Remove tag filter ${t}`}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-medium text-muted-foreground">
                Sort by
              </label>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as Sort)}
                items={{ popular: "Most popular", views: "Most viewed", recent: "Newest" }}
              >
                <SelectTrigger id="sort-select" size="sm" className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="views">Most viewed</SelectItem>
                  <SelectItem value="recent">Newest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-sm font-medium text-foreground">No videos found.</p>
              <p className="mt-1 text-sm text-muted-foreground">Try another keyword or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {results.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultsRemountOnQueryChange() {
  // Remounts SearchResults (resetting its local queryDraft/filter state)
  // whenever ?q= changes from outside this page — the header search box or
  // a trending-tag link navigating here while /search is already mounted.
  // Same key-remount trick HeaderSearchForm uses for the same reason.
  const q = useSearchParams().get("q") ?? "";
  return <SearchResults key={q} />;
}

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="px-6 py-8 md:px-10 text-sm text-muted-foreground">Loading search…</div>}>
        <SearchResultsRemountOnQueryChange />
      </Suspense>
    </AppShell>
  );
}

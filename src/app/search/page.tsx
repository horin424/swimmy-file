"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Clock, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { VideoCard } from "@/components/video-card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { videos, categories, trendingTags } from "@/lib/mock-data";

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
  const query = searchParams.get("q") ?? "";

  const [category, setCategory] = useState<string>("all");
  const [tags, setTags] = useState<string[]>([]);
  const [period, setPeriod] = useState<Period>("all");
  const [sort, setSort] = useState<Sort>("popular");
  const [now] = useState(() => Date.now());

  const toggleTag = (slug: string) => {
    setTags((prev) => (prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]));
  };

  const results = useMemo(() => {
    let list = videos.filter((v) => v.status === "active" && v.visibility === "public");
    if (query.trim()) {
      const q = query.toLowerCase();
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
  }, [query, category, tags, period, sort, now]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {query ? (
            <>
              Showing results for <span className="text-foreground">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Find videos by title, tag, or category."
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="flex flex-col gap-6">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Category
            </p>
            <div className="flex flex-col gap-0.5">
              {categories.map((c) => (
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
            <div className="rounded-xl border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
              No videos match your filters.
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

export default function SearchPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="px-6 py-8 md:px-10 text-sm text-muted-foreground">Loading search…</div>}>
        <SearchResults />
      </Suspense>
    </AppShell>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { videos, browsableCategories } from "@/lib/mock-data";

const PAGE_SIZE = 10;
const PERIODS = [
  { value: "all", label: "All" },
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
] as const;

type Period = (typeof PERIODS)[number]["value"];

const periodHours: Record<Period, number | null> = {
  all: null,
  "24h": 24,
  "7d": 24 * 7,
  "30d": 24 * 30,
};

// Rising/Popular/New are sort modes, not categories — they don't filter
// which videos show up, only the order. "Rising" is the default because
// `videos` is already sorted by rankScore (views + recency, minus reports).
const MODES = [
  { value: "rising", label: "Rising" },
  { value: "popular", label: "Popular" },
  { value: "new", label: "New" },
] as const;

type Mode = (typeof MODES)[number]["value"];

export default function DiscoverPage() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [period, setPeriod] = useState<Period>("all");
  const [category, setCategory] = useState<string>("all");
  const [mode, setMode] = useState<Mode>("rising");
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => {
    const maxHours = periodHours[period];
    const list = videos.filter((v) => {
      if (category !== "all" && v.category !== category) return false;
      if (maxHours !== null) {
        const hoursAgo = (now - new Date(v.createdAt).getTime()) / 3600000;
        if (hoursAgo > maxHours) return false;
      }
      return true;
    });
    if (mode === "popular") return [...list].sort((a, b) => b.views - a.views);
    if (mode === "new") return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [period, category, mode, now]);

  const [top, ...rest] = filtered;
  const featured = top ? [top, ...rest.slice(0, 2)] : [];
  const grid = rest.slice(2);
  const visibleGrid = grid.slice(0, visibleCount);
  const hasMore = visibleCount < grid.length;

  return (
    <AppShell>
      <section className="border-b border-border px-6 py-6 md:px-10 md:py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Discover <span className="text-primary">Swimmy File</span>
            </h1>
            <p className="mt-1.5 max-w-lg text-sm text-muted-foreground">
              Upload a file, get a shareable link, and let public uploads appear here.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-border bg-accent p-1 text-sm">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 font-medium transition-colors",
                  period === p.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Sort</span>
          <div className="flex items-center gap-1 rounded-full border border-border bg-accent p-1 text-sm">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={cn(
                  "rounded-full px-3 py-1 font-medium transition-colors",
                  mode === m.value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {browsableCategories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                category === c.slug
                  ? "bg-primary/15 text-primary"
                  : "border border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 py-8 md:px-10">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-warning" />
          <h2 className="text-lg font-semibold">Rising now</h2>
        </div>
        {featured.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No public uploads match these filters yet.
          </p>
        ) : (
          // Capped narrower than the rest of the page at lg+ — at full content
          // width these cards (16:9, so height scales with width) get taller
          // than intended; ~18% narrower keeps the ratio but trims the height.
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-[82%]">
            {featured.map((v, idx) => (
              <VideoCard key={v.id} video={v} featured={idx === 0} />
            ))}
          </div>
        )}
      </section>

      {grid.length > 0 && (
        <section className="px-6 pb-16 md:px-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">More public uploads</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {visibleGrid.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
                Load more
              </Button>
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}

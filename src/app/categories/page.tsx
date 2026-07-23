import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { videos, categories, formatCount } from "@/lib/mock-data";

const EXCLUDED_SLUGS = new Set(["all", "popular", "new"]);

export default function CategoriesPage() {
  const genreCategories = categories.filter((c) => !EXCLUDED_SLUGS.has(c.slug));
  const publicVideos = videos.filter((v) => v.status === "active" && v.visibility === "public");

  const cards = genreCategories.map((category) => {
    const inCategory = publicVideos.filter((v) => v.category === category.slug);
    return { category, count: inCategory.length, preview: inCategory.slice(0, 3) };
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Browse Swimmy File by category.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ category, count, preview }) => (
            <Link
              key={category.slug}
              href={`/search?category=${category.slug}`}
              className="group overflow-hidden rounded-2xl border border-border bg-card/50 transition-colors hover:border-border-strong"
            >
              <div className="grid h-24 grid-cols-3 gap-0.5 bg-border">
                {Array.from({ length: 3 }).map((_, i) => {
                  const v = preview[i];
                  return (
                    <div
                      key={i}
                      style={
                        v
                          ? { background: `linear-gradient(155deg, ${v.thumbnailGradient[0]}, ${v.thumbnailGradient[1]})` }
                          : { background: "oklch(0.22 0.01 260)" }
                      }
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{category.name}</p>
                  {category.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{category.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {count === 0 ? "No public uploads yet" : `${formatCount(count)} public uploads`}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

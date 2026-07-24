"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Download } from "lucide-react";
import { VideoCard } from "@/components/video-card";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ReportButton } from "@/components/report-button";
import { PackageFileRow } from "@/components/package-file-row";
import { Button } from "@/components/ui/button";
import { getRecentPackage } from "@/lib/recent-packages";
import { formatCount } from "@/lib/mock-data";
import { formatBytes } from "@/lib/utils";
import type { SharePackage, Video } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

// Server-rendered /d/[shareToken] always starts from the deterministic mock
// package for that token (see getPackageByShareToken in mock-data.ts) so
// the page has real content on first paint and works for anyone's browser.
// If *this* browser is the one that actually created the package (see
// saveRecentPackage in use-multi-file-upload-flow.ts), it swaps in the real
// uploaded files right after mount — same "assume a default, correct it
// once we can check locally" pattern already used by lib/session.ts.
export function SharedPackageView({
  shareToken,
  fallbackPackage,
  isMineFallback,
  related,
}: {
  shareToken: string;
  fallbackPackage: SharePackage;
  isMineFallback: boolean;
  related: Video[];
}) {
  const [pkg, setPkg] = useState(fallbackPackage);
  const [isMine, setIsMine] = useState(isMineFallback);

  useEffect(() => {
    Promise.resolve().then(() => {
      const recent = getRecentPackage(shareToken);
      if (recent) {
        setPkg(recent);
        // Only the uploader's own browser ever has this stashed locally —
        // by definition, that means this package is "mine".
        setIsMine(true);
      }
    });
  }, [shareToken]);

  const shareUrl = `swimmyfile.io/d/${pkg.shareToken}`;
  const fullShareUrl = `https://${shareUrl}`;
  const isPublic = pkg.visibility === "public";

  return (
    <>
      <div className="mx-auto max-w-xl px-6 py-10 md:py-14">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Shared files</p>
          <h1 className="mt-1 truncate text-lg font-semibold" title={pkg.title}>
            {pkg.title}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {pkg.fileCount} {pkg.fileCount === 1 ? "file" : "files"} · {formatBytes(pkg.totalSizeBytes)} total
          </p>
          <p className="text-sm text-muted-foreground">
            Expires {dateFormatter.format(new Date(pkg.expiresAt))} ·{" "}
            {/* Quick Share default is Link only — only an explicit Publish
                to Discover ever makes a package Public (see
                use-multi-file-upload-flow.ts's publishToDiscover). */}
            {isPublic ? "Public" : "Link only"}
          </p>
          <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(pkg.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {formatCount(pkg.downloadCount)}
            </span>
            <span>{isPublic ? "Listed on Discover" : "Only people with this link can access these files"}</span>
          </p>

          {/* Inline URL + Copy Link pill — same layout as the upload
              complete screen, so the two read as one consistent pattern
              instead of a button floating away from the link it copies. */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-background/60 p-2 pl-4">
              <code className="flex-1 truncate text-left text-sm text-muted-foreground">{fullShareUrl}</code>
              <CopyLinkButton url={shareUrl} />
            </div>
            {!isMine && <ReportButton />}
          </div>

          <ul className="mt-5 flex flex-col gap-2">
            {pkg.files.map((f, i) => (
              <PackageFileRow key={f.id} index={i + 1} file={f} />
            ))}
          </ul>

          {/* Deliberately understated — plain centered text, not a
              full-width disabled button — so it reads as a coming-soon
              note rather than a broken primary download action. */}
          <p className="mt-4 text-center text-xs text-muted-foreground/50">Download all as ZIP — coming later</p>
        </div>

        {/* A private/link-only package's page shouldn't suddenly recommend
            public content — that's surprising on what's meant to read as a
            private share. Public packages still get the full section below;
            private ones get nothing more than a small way out to Discover. */}
        {!isPublic && (
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/discover" className="text-primary hover:underline">
              Explore public uploads
            </Link>
          </p>
        )}
      </div>

      {isPublic && related.length > 0 && (
        <section className="border-t border-border px-6 py-14 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">More public uploads</h2>
                <p className="mt-1 text-sm text-muted-foreground">Other shared files you might like.</p>
              </div>
              <Button variant="outline" size="sm" render={<Link href="/discover" />} nativeButton={false}>
                Open Discover
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {related.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

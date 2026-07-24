import { notFound } from "next/navigation";
import Link from "next/link";
import { Eye, Download } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { VideoCard } from "@/components/video-card";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ReportButton } from "@/components/report-button";
import { PackageFileRow } from "@/components/package-file-row";
import { Button } from "@/components/ui/button";
import { getPackageByShareToken, videos, myVideoIds, formatCount } from "@/lib/mock-data";
import { formatBytes } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

// This is the file-sharing landing page (think Gofile/GigaFile), not a
// video-watching page — one share link can hold one or more files (see
// SharePackage/PackageFile in lib/types.ts). Deliberately no sidebar, no
// "More like this" rail, no uploader profile block. Just: the file list and
// the actions someone opening a shared link actually wants (download each
// file, copy the link, report). See PublicLayout for the shared no-sidebar
// chrome used here, on /, and on /upload.
export default async function SharedPackagePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const pkg = getPackageByShareToken(shareToken);
  if (!pkg) notFound();

  // CopyLinkButton prepends https:// itself, so it needs the bare domain —
  // the visible text uses the full URL instead (see client feedback: the
  // on-screen link should read as a real https:// URL, not a bare domain).
  const shareUrl = `swimmyfile.io/d/${pkg.shareToken}`;
  const fullShareUrl = `https://${shareUrl}`;
  // You can't report your own upload — this is one of "my files".
  const isMine = myVideoIds.has(pkg.id);
  const isPublic = pkg.visibility === "public";
  const related = isPublic ? videos.filter((v) => v.id !== pkg.id && v.category === pkg.category).slice(0, 6) : [];

  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-6 py-10 md:py-14">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Shared files</p>
          <h1 className="mt-1 truncate text-lg font-semibold" title={pkg.title}>
            {pkg.title}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {pkg.fileCount} {pkg.fileCount === 1 ? "file" : "files"} · {formatBytes(pkg.totalSizeBytes)} total
          </p>
          <p className="text-sm text-muted-foreground">Expires {dateFormatter.format(new Date(pkg.expiresAt))}</p>
          <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground/70">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {formatCount(pkg.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {formatCount(pkg.downloadCount)}
            </span>
            <span>{isPublic ? "Public — listed on Discover" : "Only people with this link can access these files"}</span>
          </p>

          {/* Copy Link/Report lead, right under the summary — these are
              what someone opening a shared link actually came for; the
              file list below is the main content, not a reason to scroll
              past the actions first. */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <CopyLinkButton url={shareUrl} />
            {!isMine && <ReportButton />}
          </div>

          <p className="mt-3 truncate rounded-lg bg-black/30 px-3 py-2 font-mono text-xs text-muted-foreground">
            {fullShareUrl}
          </p>

          <ul className="mt-5 flex flex-col gap-2">
            {pkg.files.map((f, i) => (
              <PackageFileRow key={f.id} index={i + 1} file={f} />
            ))}
          </ul>

          <Button
            variant="outline"
            size="sm"
            disabled
            title="Coming in a future update"
            className="mt-4 w-full text-muted-foreground/60"
          >
            Download all as ZIP — coming later
          </Button>
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
    </PublicLayout>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Play, Eye, Download } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { VideoThumb } from "@/components/video-thumb";
import { VideoCard } from "@/components/video-card";
import { CopyLinkButton } from "@/components/copy-link-button";
import { DownloadButton } from "@/components/download-button";
import { ReportButton } from "@/components/report-button";
import { Button } from "@/components/ui/button";
import { videos, myVideoIds, formatCount, formatFileSize } from "@/lib/mock-data";

const dateFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" });

// This is the file-sharing landing page (think Gofile/GigaFile), not a
// video-watching page — deliberately no sidebar, no "More like this" rail,
// no uploader profile block. Just: preview, file facts, and the actions
// someone opening a shared link actually wants (download, copy, report).
// See PublicLayout for the shared no-sidebar chrome used here, on /, and
// on /upload.
export default async function SharedFilePage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const video = videos.find((v) => v.shareToken === shareToken);
  if (!video) notFound();

  const shareUrl = `swimmyfile.io/d/${video.shareToken}`;
  // You can't report your own upload — this is one of "my files".
  const isMine = myVideoIds.has(video.id);
  const related = videos.filter((v) => v.id !== video.id && v.category === video.category).slice(0, 6);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-xl px-6 py-10 md:py-14">
        <div className="overflow-hidden rounded-2xl border border-border bg-card/50">
          <div className="relative aspect-video w-full">
            <VideoThumb gradient={video.thumbnailGradient} duration={video.durationSeconds} className="rounded-none">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform hover:scale-105">
                  <Play className="ml-1 h-6 w-6 fill-white text-white" />
                </div>
              </div>
            </VideoThumb>
          </div>

          <div className="p-6">
            <h1 className="truncate text-lg font-semibold" title={video.title}>
              {video.title}
            </h1>

            <dl className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <dt>File size</dt>
                <dd className="text-foreground">{formatFileSize(video.fileSizeMb)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Uploaded</dt>
                <dd className="text-foreground">{dateFormatter.format(new Date(video.createdAt))}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Expires</dt>
                <dd className="text-foreground">{dateFormatter.format(new Date(video.expiresAt))}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Views
                </dt>
                <dd className="flex items-center gap-3 text-foreground">
                  {formatCount(video.views)}
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Download className="h-3.5 w-3.5" />
                    {formatCount(video.downloadCount)}
                  </span>
                </dd>
              </div>
            </dl>

            <p className="mt-4 truncate rounded-lg bg-black/30 px-3 py-2 font-mono text-xs text-muted-foreground">
              {shareUrl}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <DownloadButton fileName={video.title} />
              <CopyLinkButton url={shareUrl} />
              {!isMine && <ReportButton />}
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
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

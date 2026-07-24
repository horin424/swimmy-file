import Link from "next/link";
import { Eye, Download } from "lucide-react";
import { VideoThumb } from "./video-thumb";
import { ReportButton } from "./report-button";
import { CopyLinkButton } from "./copy-link-button";
import { cn, formatBytes } from "@/lib/utils";
import { formatCount, myVideoIds, packageSummary } from "@/lib/mock-data";
import { fileTypeLabel } from "@/lib/file-type";
import type { Video } from "@/lib/types";

export function VideoCard({
  video,
  featured = false,
}: {
  video: Video;
  featured?: boolean;
}) {
  const rank = video.rank;
  const showRankBadge = typeof rank === "number" && rank <= 12;
  const isMine = myVideoIds.has(video.id);
  const pkg = packageSummary(video);
  // A single-file package still just reads as a video card (per the
  // product direction: "if the package contains only one video, it can
  // still look like a video card") — the multi-file badges only show up
  // once there's actually more than one file to summarize.
  const isSingleFile = pkg.fileCount <= 1;

  return (
    <Link
      href={`/d/${video.shareToken}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-150 hover:border-border-strong"
    >
      <div className="relative aspect-video w-full">
        <VideoThumb gradient={video.thumbnailGradient} duration={video.durationSeconds}>
          {showRankBadge && (
            <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
              #{rank}
            </span>
          )}
          <div className="absolute right-2 top-2 flex items-center gap-1.5">
            <CopyLinkButton url={`swimmyfile.io/d/${video.shareToken}`} variant="icon" />
            {!isMine && <ReportButton variant="icon" />}
          </div>
        </VideoThumb>
      </div>
      <div className="flex shrink-0 flex-col gap-1 p-3">
        <p className={cn("line-clamp-2 font-medium text-foreground", featured ? "text-base" : "text-sm")}>
          {video.title}
        </p>
        {/* File-sharing metadata (type/size, views/downloads) instead of an
            uploader handle — a shared-file card, not a creator's video post. */}
        <p className="text-xs text-muted-foreground">
          {isSingleFile
            ? `${fileTypeLabel(pkg.fileTypes[0] ?? "VIDEO")} · ${formatBytes(pkg.totalSizeBytes)}`
            : `${pkg.fileCount} files · ${formatBytes(pkg.totalSizeBytes)}`}
        </p>
        {!isSingleFile && (
          <p className="text-xs text-muted-foreground/70">{pkg.fileTypes.map(fileTypeLabel).join(", ")}</p>
        )}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatCount(video.views)}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-3.5 w-3.5" />
            {formatCount(video.downloadCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}

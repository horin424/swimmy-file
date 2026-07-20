import Link from "next/link";
import { Eye } from "lucide-react";
import { VideoThumb } from "./video-thumb";
import { cn } from "@/lib/utils";
import { formatCount } from "@/lib/mock-data";
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

  return (
    <Link
      href={`/v/${video.shareToken}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-150 hover:border-border-strong"
    >
      <div className="relative aspect-video w-full">
        <VideoThumb gradient={video.thumbnailGradient} duration={video.durationSeconds}>
          {showRankBadge && (
            <span className="absolute left-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
              #{rank}
            </span>
          )}
        </VideoThumb>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5 p-3">
        <p className={cn("line-clamp-2 font-medium text-foreground", featured ? "text-base" : "text-sm")}>
          {video.title}
        </p>
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">@{video.uploader.handle}</span>
          <span className="flex shrink-0 items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {formatCount(video.views)}
          </span>
        </div>
      </div>
    </Link>
  );
}

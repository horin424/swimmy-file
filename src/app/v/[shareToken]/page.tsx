import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { VideoCard } from "@/components/video-card";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ReportButton } from "@/components/report-button";
import { VideoThumb } from "@/components/video-thumb";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, CalendarClock } from "lucide-react";
import { videos, myVideoIds, formatCount, timeAgo } from "@/lib/mock-data";

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ shareToken: string }>;
}) {
  const { shareToken } = await params;
  const video = videos.find((v) => v.shareToken === shareToken);
  if (!video) notFound();

  const related = videos.filter((v) => v.id !== video.id && v.category === video.category).slice(0, 6);
  const shareUrl = `swimmyfile.io/v/${video.shareToken}`;
  // You can't report your own upload — this is one of "my files".
  const isMine = myVideoIds.has(video.id);

  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-5">
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border">
            <VideoThumb gradient={video.thumbnailGradient} duration={video.durationSeconds} className="rounded-none h-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform hover:scale-105">
                  <div className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
                </div>
              </div>
            </VideoThumb>
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">{video.category}</Badge>
              {video.tags.map((t) => (
                <Badge key={t} variant="outline" className="text-muted-foreground">
                  #{t}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{video.title}</h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                {formatCount(video.views)} views
              </span>
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" />
                {timeAgo(video.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card/50 p-3">
            <code className="flex-1 truncate rounded-lg bg-black/30 px-3 py-2 text-sm text-muted-foreground">
              {shareUrl}
            </code>
            <CopyLinkButton url={shareUrl} />
            {!isMine && <ReportButton />}
          </div>

          <div className="rounded-xl border border-border bg-card/40 p-4">
            <div className="mb-3 flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarFallback
                  className="text-xs text-white"
                  style={{ background: video.uploader.avatarColor }}
                >
                  {video.uploader.handle.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">@{video.uploader.handle}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{video.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              More like this
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {related.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

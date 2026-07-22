"use client";

import Link from "next/link";
import { Eye, HardDrive, Upload as UploadIcon, Film, LifeBuoy, Gauge, FileUp } from "lucide-react";
import { VideoThumb } from "@/components/video-thumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  myVideos,
  formatCount,
  timeAgo,
  currentUserStorage,
  currentUserUploadLimit,
} from "@/lib/mock-data";
import type { VideoStatus } from "@/lib/types";

const statusVariant: Record<VideoStatus, "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  processing: "outline",
  hidden: "outline",
  removed: "destructive",
};

export default function DashboardPage() {
  const recentUploads = [...myVideos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const storagePct = Math.round((currentUserStorage.usedGb / currentUserStorage.totalGb) * 100);
  const totalViews = myVideos.reduce((sum, v) => sum + v.views, 0);
  const totalReports = myVideos.reduce((sum, v) => sum + v.reportCount, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of your account and uploads.</p>
      </div>

      <div className="mb-6 flex flex-col gap-6 rounded-2xl border border-border bg-card/40 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border border-border">
            <AvatarFallback className="bg-gradient-brand text-lg text-white">DU</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">@demo_user</p>
            <p className="text-sm text-muted-foreground">Joined Jul 2026</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span>{myVideos.length} uploads</span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {formatCount(totalViews)} views total
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            size="sm"
            className="gap-1.5 bg-gradient-brand text-white hover:opacity-90"
          >
            <UploadIcon className="h-3.5 w-3.5" />
            Upload a video
          </Button>
          <Button render={<Link href="/me/videos" />} nativeButton={false} variant="outline" size="sm" className="gap-1.5">
            <Film className="h-3.5 w-3.5" />
            View my videos
          </Button>
          <Button render={<Link href="/support" />} nativeButton={false} variant="outline" size="sm" className="gap-1.5">
            <LifeBuoy className="h-3.5 w-3.5" />
            Contact support
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Total videos", value: myVideos.length },
          { label: "Total views", value: formatCount(totalViews) },
          { label: "Storage used", value: `${storagePct}%` },
          { label: "Flagged for review", value: totalReports, accent: totalReports > 0 },
        ].map((s) => (
          <div
            key={s.label}
            className={
              "rounded-xl border border-border bg-card/50 p-4" +
              (s.accent ? " border-destructive/30 bg-destructive/5" : "")
            }
          >
            <p className={"text-2xl font-semibold tabular-nums" + (s.accent ? " text-destructive" : "")}>
              {s.value}
            </p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card/40 p-5">
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <Gauge className="h-3.5 w-3.5" />
            Upload limits
          </h2>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today&apos;s uploads</span>
              <span className="font-medium tabular-nums">
                {currentUserUploadLimit.uploadsToday} / {currentUserUploadLimit.dailyUploadLimit}
              </span>
            </div>
            <Progress
              value={(currentUserUploadLimit.uploadsToday / currentUserUploadLimit.dailyUploadLimit) * 100}
              className="h-1.5"
            />
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <FileUp className="h-3.5 w-3.5" />
                Max file size
              </span>
              <span className="font-medium">{currentUserUploadLimit.maxFileSizeGb}GB per file</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <HardDrive className="h-3.5 w-3.5" />
                Storage
              </span>
              <span className="font-medium tabular-nums">
                {currentUserStorage.usedGb} / {currentUserStorage.totalGb} GB
              </span>
            </div>
            <Progress value={storagePct} className="h-1.5" />
            <p className="text-xs text-muted-foreground/70">
              New accounts: 5 uploads/day · 2GB per file · 10GB total.{" "}
              <span className="text-primary">Upgrade for more</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/40 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent uploads</h2>
            <Link href="/me/videos" className="text-xs text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {recentUploads.slice(0, 4).map((v) => (
              <Link
                key={v.id}
                href={`/v/${v.shareToken}`}
                className="flex items-center gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:border-border-strong"
              >
                <div className="h-9 w-14 shrink-0 overflow-hidden rounded-md">
                  <VideoThumb gradient={v.thumbnailGradient} duration={v.durationSeconds} className="rounded-md" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{v.title}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(v.createdAt)}</p>
                </div>
                <Badge variant={statusVariant[v.status]} className="h-4 shrink-0 px-1.5 text-[10px] capitalize">
                  {v.status}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

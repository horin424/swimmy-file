"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock, ImageIcon, RotateCcw } from "lucide-react";
import { VideoThumb } from "@/components/video-thumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { uploadHistory, formatFileSize, timeAgo } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { UploadPipelineStatus, ThumbnailPipelineStatus } from "@/lib/types";
import { toast } from "sonner";

const uploadStatusVariant: Record<UploadPipelineStatus, "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  processing: "outline",
  failed: "destructive",
  expired: "outline",
};

const uploadStatusLabel: Record<UploadPipelineStatus, string> = {
  active: "Active",
  processing: "Processing",
  failed: "Failed",
  expired: "Expired",
};

const thumbnailLabel: Record<ThumbnailPipelineStatus, string> = {
  generated: "Generated",
  pending: "Generating…",
  failed: "Unavailable",
};

export default function UploadHistoryPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Upload History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track every upload attempt and its processing status — separate from My Videos, which manages what&apos;s
          already published.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {uploadHistory.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-3 sm:flex-row sm:items-center",
              entry.uploadStatus === "failed" && "border-destructive/30 bg-destructive/5",
            )}
          >
            <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg">
              {entry.shareToken ? (
                <Link href={`/v/${entry.shareToken}`} className="block h-full w-full">
                  <VideoThumb gradient={entry.thumbnailGradient} className="rounded-lg" />
                </Link>
              ) : (
                <VideoThumb gradient={entry.thumbnailGradient} className="rounded-lg opacity-60" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{entry.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Uploaded {timeAgo(entry.createdAt)}
                </span>
                <span>{formatFileSize(entry.fileSizeMb)}</span>
                <span className="flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" />
                  Thumbnail: {thumbnailLabel[entry.thumbnailStatus]}
                </span>
              </div>
              {entry.uploadStatus === "failed" && entry.errorReason && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Reason: {entry.errorReason}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <Badge variant={uploadStatusVariant[entry.uploadStatus]} className="gap-1">
                {entry.uploadStatus === "active" && <CheckCircle2 className="h-3 w-3" />}
                {uploadStatusLabel[entry.uploadStatus]}
              </Badge>
              {entry.uploadStatus === "failed" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => toast("Retrying upload…")}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry upload
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

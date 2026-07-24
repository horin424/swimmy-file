"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Download,
  Trash2,
  Pencil,
  Globe2,
  Link2,
  Copy,
  ExternalLink,
  Upload as UploadIcon,
} from "lucide-react";
import { VideoThumb } from "@/components/video-thumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { myVideos, videoToPackage, expiresIn } from "@/lib/mock-data";
import { fileTypeLabel } from "@/lib/file-type";
import { cn, formatBytes } from "@/lib/utils";
import type { VideoStatus } from "@/lib/types";
import { toast } from "sonner";

const statusVariant: Record<VideoStatus, "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  processing: "outline",
  hidden: "outline",
  removed: "destructive",
};

type FilterValue = "all" | "public" | "link-only" | "active" | "processing" | "hidden" | "reported" | "expired";

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "link-only", label: "Link only" },
  { value: "active", label: "Active" },
  { value: "processing", label: "Processing" },
  { value: "hidden", label: "Hidden" },
  { value: "reported", label: "Reported" },
  { value: "expired", label: "Expired" },
];

type SortValue = "newest" | "views" | "expiring" | "largest";

const sortOptions: { value: SortValue; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "views", label: "Most viewed" },
  { value: "expiring", label: "Expiring soon" },
  { value: "largest", label: "Largest package" },
];

// Each row is one SharePackage (see videoToPackage in mock-data.ts) — not
// one file. A package with several files still gets exactly one row here,
// same as it gets exactly one Discover card and one shared link.
export default function MyUploadsPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");
  // Local-only simulation of Publish to Discover state — every 3rd demo
  // package starts Link only so the page has realistic variety instead of
  // every row uniformly Public (the underlying mock videos are all
  // Discover-eligible by default; this doesn't touch that shared pool).
  const [published, setPublished] = useState<Record<string, boolean>>(
    Object.fromEntries(myVideos.map((v, i) => [v.id, i % 3 !== 0])),
  );

  const packages = useMemo(() => myVideos.map((v) => ({ video: v, pkg: videoToPackage(v) })), []);

  const filtered = useMemo(() => {
    let list = packages.filter(({ video: v }) => {
      switch (filter) {
        case "all":
          return true;
        case "public":
          return published[v.id];
        case "link-only":
          return !published[v.id];
        case "active":
        case "processing":
        case "hidden":
          return v.status === filter;
        case "reported":
          return v.reportCount > 0;
        case "expired":
          return expiresIn(v.expiresAt) === "Expired";
        default:
          return true;
      }
    });

    list = [...list];
    if (sort === "newest") list.sort((a, b) => new Date(b.video.createdAt).getTime() - new Date(a.video.createdAt).getTime());
    if (sort === "views") list.sort((a, b) => b.video.views - a.video.views);
    if (sort === "expiring")
      list.sort((a, b) => new Date(a.video.expiresAt).getTime() - new Date(b.video.expiresAt).getTime());
    if (sort === "largest") list.sort((a, b) => b.pkg.totalSizeBytes - a.pkg.totalSizeBytes);
    return list;
  }, [packages, filter, sort, published]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Uploads</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your shared uploads.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button render={<Link href="/" />} nativeButton={false} variant="outline" size="sm" className="gap-1.5">
            <UploadIcon className="h-3.5 w-3.5" />
            Upload files
          </Button>
        </div>
      </div>

      {myVideos.length > 0 && (
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === f.value
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <label htmlFor="my-uploads-sort" className="text-xs font-medium text-muted-foreground">
              Sort by
            </label>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortValue)}
              items={Object.fromEntries(sortOptions.map((s) => [s.value, s.label]))}
            >
              <SelectTrigger id="my-uploads-sort" size="sm" className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {myVideos.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
          <div>
            <p className="text-sm font-medium">You have not uploaded any files yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Upload your first file to create a shareable link.</p>
          </div>
          <Button render={<Link href="/" />} nativeButton={false} className="gap-1.5 bg-gradient-brand text-white hover:opacity-90">
            <UploadIcon className="h-3.5 w-3.5" />
            Upload files
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No uploads match this filter.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(({ video: v, pkg }) => {
            const isPublic = published[v.id];
            return (
              <div
                key={v.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-2.5 sm:flex-row sm:items-center"
              >
                <Link href={`/d/${v.shareToken}`} className="h-14 w-24 shrink-0 overflow-hidden rounded-lg">
                  <VideoThumb gradient={v.thumbnailGradient} duration={v.durationSeconds} className="rounded-lg" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pkg.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {pkg.fileCount} {pkg.fileCount === 1 ? "file" : "files"} · {formatBytes(pkg.totalSizeBytes)}
                    </span>
                    {pkg.fileCount === 1 && <span>{fileTypeLabel(pkg.files[0].fileType)}</span>}
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {v.views.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {v.downloadCount.toLocaleString()}
                    </span>
                    <Badge variant={statusVariant[v.status]} className="h-4 px-1.5 text-[10px] capitalize">
                      {v.status}
                    </Badge>
                    <Badge variant="outline" className="h-4 px-1.5 text-[10px]">
                      {isPublic ? "Public" : "Link only"}
                    </Badge>
                    <span>{expiresIn(v.expiresAt)}</span>
                    {v.reportCount > 0 && (
                      <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
                        {v.reportCount} {v.reportCount === 1 ? "report" : "reports"}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          render={<Link href={`/d/${v.shareToken}`} target="_blank" />}
                          nativeButton={false}
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Open ${pkg.title}`}
                          className="text-muted-foreground"
                        />
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>Open</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Copy link for ${pkg.title}`}
                          className="text-muted-foreground"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(`https://swimmyfile.io/d/${v.shareToken}`);
                            } catch {
                              // clipboard API unavailable — still show optimistic feedback in this prototype
                            }
                            toast.success("Link copied to clipboard");
                          }}
                        />
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>Copy link</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${pkg.title}`} className="text-muted-foreground" />
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`${isPublic ? "Unpublish" : "Publish"} ${pkg.title} ${isPublic ? "from" : "to"} Discover`}
                          className="text-muted-foreground"
                          onClick={() =>
                            setPublished((prev) => {
                              const next = !prev[v.id];
                              toast(next ? "Published to Discover" : "Set to Link only");
                              return { ...prev, [v.id]: next };
                            })
                          }
                        />
                      }
                    >
                      {isPublic ? <Globe2 className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
                    </TooltipTrigger>
                    <TooltipContent>
                      {isPublic ? "Public — click to set Link only" : "Link only — click to publish to Discover"}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${pkg.title}`}
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => toast.error(`"${pkg.title}" deleted`)}
                        />
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

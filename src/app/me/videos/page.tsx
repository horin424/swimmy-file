"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Trash2,
  Pencil,
  Globe2,
  Lock,
  Copy,
  PlayCircle,
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
import { myVideos, formatFileSize, expiresIn } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { VideoStatus } from "@/lib/types";
import { toast } from "sonner";

const statusVariant: Record<VideoStatus, "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  processing: "outline",
  hidden: "outline",
  removed: "destructive",
};

type FilterValue = "all" | "public" | "private" | "active" | "processing" | "hidden" | "reported" | "expired";

const filters: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
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
  { value: "largest", label: "Largest file" },
];

export default function MyVideosPage() {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");
  const [visibility, setVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(myVideos.map((v) => [v.id, v.visibility === "public"])),
  );

  const filtered = useMemo(() => {
    let list = myVideos.filter((v) => {
      switch (filter) {
        case "all":
          return true;
        case "public":
          return visibility[v.id];
        case "private":
          return !visibility[v.id];
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
    if (sort === "newest") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === "views") list.sort((a, b) => b.views - a.views);
    if (sort === "expiring") list.sort((a, b) => new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime());
    if (sort === "largest") list.sort((a, b) => b.fileSizeMb - a.fileSizeMb);
    return list;
  }, [filter, sort, visibility]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Videos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your uploaded videos.</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="my-videos-sort" className="text-xs font-medium text-muted-foreground">
            Sort by
          </label>
          <Select
            value={sort}
            onValueChange={(v) => setSort(v as SortValue)}
            items={Object.fromEntries(sortOptions.map((s) => [s.value, s.label]))}
          >
            <SelectTrigger id="my-videos-sort" size="sm" className="w-40">
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

      <div className="mb-5 flex flex-wrap gap-1.5">
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

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No videos match this filter.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((v) => (
            <div
              key={v.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card/40 p-2.5 sm:flex-row sm:items-center"
            >
              <Link href={`/v/${v.shareToken}`} className="h-14 w-24 shrink-0 overflow-hidden rounded-lg">
                <VideoThumb gradient={v.thumbnailGradient} duration={v.durationSeconds} className="rounded-lg" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{v.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {v.views.toLocaleString()}
                  </span>
                  <span>{formatFileSize(v.fileSizeMb)}</span>
                  <Badge variant={statusVariant[v.status]} className="h-4 px-1.5 text-[10px] capitalize">
                    {v.status}
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
                        render={<Link href={`/v/${v.shareToken}`} target="_blank" />}
                        nativeButton={false}
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Preview ${v.title}`}
                        className="text-muted-foreground"
                      />
                    }
                  >
                    <PlayCircle className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Preview</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Copy link for ${v.title}`}
                        className="text-muted-foreground"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(`https://swimmyfile.io/v/${v.shareToken}`);
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
                      <Button variant="ghost" size="icon-sm" aria-label={`Edit ${v.title}`} className="text-muted-foreground" />
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
                        aria-label={`Change visibility for ${v.title} (currently ${visibility[v.id] ? "Public" : "Private"})`}
                        className="text-muted-foreground"
                        onClick={() =>
                          setVisibility((prev) => {
                            const next = !prev[v.id];
                            toast(next ? "Video set to public" : "Video set to private");
                            return { ...prev, [v.id]: next };
                          })
                        }
                      />
                    }
                  >
                    {visibility[v.id] ? <Globe2 className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </TooltipTrigger>
                  <TooltipContent>
                    {visibility[v.id] ? "Public — click to make Private" : "Private — click to make Public"}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${v.title}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => toast.error(`"${v.title}" deleted`)}
                      />
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

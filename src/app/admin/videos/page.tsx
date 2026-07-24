"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Trash2, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { videos as seedVideos } from "@/lib/mock-data";
import type { VideoStatus } from "@/lib/types";
import { toast } from "sonner";

const statusVariant: Record<VideoStatus, "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  processing: "outline",
  hidden: "outline",
  removed: "destructive",
};

export default function AdminVideosPage() {
  const [statuses, setStatuses] = useState<Record<string, VideoStatus>>(
    Object.fromEntries(seedVideos.map((v) => [v.id, v.status])),
  );

  const setStatus = (id: string, status: VideoStatus, message: string) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    toast(message);
  };

  const sorted = [...seedVideos].sort((a, b) => b.reportCount - a.reportCount);

  const rowActions = (v: (typeof sorted)[number], status: VideoStatus) => (
    <>
      {status === "hidden" ? (
        <Button
          variant="ghost"
          size="icon-sm"
          title="Restore"
          onClick={() => setStatus(v.id, "active", `"${v.title}" restored`)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="icon-sm"
          title="Hide"
          onClick={() => setStatus(v.id, "hidden", `"${v.title}" hidden from Discover`)}
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        title="Delete"
        className="text-destructive hover:text-destructive"
        onClick={() => setStatus(v.id, "removed", `"${v.title}" removed`)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </>
  );

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Uploads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review flagged content and manage visibility across the platform.
          </p>
        </div>

        {/* Mobile: stacked cards */}
        <div className="flex flex-col gap-2 md:hidden">
          {sorted.map((v) => {
            const status = statuses[v.id];
            return (
              <div key={v.id} className="rounded-xl border border-border bg-card/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/d/${v.shareToken}`}
                    target="_blank"
                    className="flex min-w-0 items-center gap-1.5 font-medium hover:text-primary"
                  >
                    <span className="truncate">{v.title}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </Link>
                  <div className="flex shrink-0">{rowActions(v, status)}</div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>@{v.uploader.handle}</span>
                  <Badge variant={statusVariant[status]} className="capitalize">
                    {status}
                  </Badge>
                  {v.reportCount > 0 && (
                    <Badge variant="destructive">
                      {v.reportCount} {v.reportCount === 1 ? "report" : "reports"}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden rounded-2xl border border-border bg-card/40 md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Upload</TableHead>
                <TableHead>Uploader</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((v) => {
                const status = statuses[v.id];
                return (
                  <TableRow key={v.id}>
                    <TableCell className="max-w-xs">
                      <Link
                        href={`/d/${v.shareToken}`}
                        target="_blank"
                        className="flex items-center gap-1.5 truncate font-medium hover:text-primary"
                      >
                        {v.title}
                        <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">@{v.uploader.handle}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[status]} className="capitalize">
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {v.reportCount > 0 ? (
                        <Badge variant="destructive">{v.reportCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">{rowActions(v, status)}</div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}

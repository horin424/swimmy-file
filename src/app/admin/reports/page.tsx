"use client";

import { useState } from "react";
import Link from "next/link";
import { Flag, ExternalLink } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { reportTickets as seedReports } from "@/lib/admin-data";
import type { ReportTicketStatus } from "@/lib/types";
import { toast } from "sonner";

const reasonLabel: Record<string, string> = {
  copyright: "Copyright",
  spam: "Spam",
  adult: "Adult content",
  violence: "Violence",
  other: "Other",
};

const statusOptions: { value: ReportTicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const statusBadgeVariant: Record<ReportTicketStatus, "secondary" | "outline" | "destructive"> = {
  open: "destructive",
  reviewing: "secondary",
  resolved: "outline",
  rejected: "outline",
};

export default function AdminReportsPage() {
  const [statuses, setStatuses] = useState<Record<string, ReportTicketStatus>>(
    Object.fromEntries(seedReports.map((r) => [r.id, r.status])),
  );

  const openCount = Object.values(statuses).filter((s) => s === "open").length;

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Individual reports filed against shared uploads, separate from overall upload moderation.
            </p>
          </div>
          {openCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <Flag className="h-3 w-3" />
              {openCount} open
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {seedReports.map((r) => {
            const status = statuses[r.id];
            return (
              <div key={r.id} className="rounded-xl border border-border bg-card/40 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{reasonLabel[r.reason]}</Badge>
                  <Badge variant={statusBadgeVariant[status]} className="capitalize">
                    {status}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {r.reporterHandle ? `@${r.reporterHandle}` : "Anonymous"}
                  </span>
                </div>

                <Link
                  href={`/d/${r.shareToken}`}
                  target="_blank"
                  className="flex items-center gap-1.5 font-medium hover:text-primary"
                >
                  {r.videoTitle}
                  <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                </Link>
                {r.message && <p className="mt-1 text-sm text-muted-foreground">{r.message}</p>}

                <div className="mt-3 flex items-center justify-between">
                  <Link
                    href="/admin/videos"
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Manage this upload
                  </Link>
                  <Select
                    value={status}
                    onValueChange={(v) => {
                      const next = v as ReportTicketStatus;
                      setStatuses((prev) => ({ ...prev, [r.id]: next }));
                      toast(`Report marked as ${next}`);
                    }}
                    items={Object.fromEntries(statusOptions.map((o) => [o.value, o.label]))}
                  >
                    <SelectTrigger size="sm" className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}

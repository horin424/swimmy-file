import Link from "next/link";
import { Film, Users, Flag, Inbox, ArrowUpRight } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { videos, formatCount } from "@/lib/mock-data";
import { adminUsers, inquiries } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const flaggedVideos = videos.filter((v) => v.reportCount > 0);
  const openInquiries = inquiries.filter((i) => i.status === "open");
  const bannedUsers = adminUsers.filter((u) => u.status === "banned");

  const stats = [
    { label: "Total videos", value: videos.length, icon: Film, href: "/admin/videos" },
    { label: "Total users", value: adminUsers.length, icon: Users, href: "/admin/users" },
    { label: "Flagged for review", value: flaggedVideos.length, icon: Flag, href: "/admin/reports", accent: true },
    { label: "Open inquiries", value: openInquiries.length, icon: Inbox, href: "/admin/inquiries" },
  ];

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Overview of Swimmy File&apos;s current moderation and account activity.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className={cn(
                "rounded-xl border border-border bg-card/50 p-4 transition-colors hover:border-border-strong",
                s.accent && flaggedVideos.length > 0 && "border-destructive/30 bg-destructive/5",
              )}
            >
              <div className="flex items-center justify-between">
                <s.icon className={cn("h-4 w-4", s.accent && flaggedVideos.length > 0 ? "text-destructive" : "text-muted-foreground")} />
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Moderation queue
              </h2>
              <Link href="/admin/reports" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            {flaggedVideos.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nothing flagged right now.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {flaggedVideos.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{v.title}</p>
                      <p className="text-xs text-muted-foreground">@{v.uploader.handle}</p>
                    </div>
                    <Badge variant="destructive" className="shrink-0">
                      {v.reportCount} {v.reportCount === 1 ? "report" : "reports"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recent inquiries
              </h2>
              <Link href="/admin/inquiries" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {inquiries.slice(0, 4).map((i) => (
                <div key={i.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{i.subject}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="capitalize">{i.category}</span> · {i.email}
                    </p>
                  </div>
                  <Badge variant={i.status === "open" ? "secondary" : "outline"} className="shrink-0 capitalize">
                    {i.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {bannedUsers.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-card/40 p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Banned users
            </h2>
            <div className="flex flex-wrap gap-2">
              {bannedUsers.map((u) => (
                <Badge key={u.id} variant="destructive">
                  @{u.handle} · {formatCount(u.reportCount)} reports
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

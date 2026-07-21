"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  HardDrive,
  Trash2,
  Pencil,
  Globe2,
  Lock,
  Bell,
  KeyRound,
  Copy,
  Upload as UploadIcon,
  Flag,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { RequireUser } from "@/components/require-user";
import { VideoThumb } from "@/components/video-thumb";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { videos, formatCount, formatFileSize, expiresIn, timeAgo, currentUserStorage } from "@/lib/mock-data";
import type { VideoStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusVariant: Record<VideoStatus, "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  processing: "outline",
  hidden: "outline",
  removed: "destructive",
};

const TAB_VALUES = ["dashboard", "videos", "uploads", "settings"] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return TAB_VALUES.includes(value as TabValue);
}

function MyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  // Derived directly from the URL on every render (no local state) so a
  // Link elsewhere (sidebar, account menu) landing on a different
  // /me?tab=... while this page is already mounted is reflected immediately
  // — a plain defaultValue on <Tabs> would only apply once, on first mount.
  const tab: TabValue = isTabValue(tabParam) ? tabParam : "dashboard";

  const myVideos = videos.slice(0, 7);
  const recentUploads = [...myVideos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const [visibility, setVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(myVideos.map((v) => [v.id, v.visibility === "public"])),
  );

  const storagePct = Math.round((currentUserStorage.usedGb / currentUserStorage.totalGb) * 100);
  const totalViews = myVideos.reduce((sum, v) => sum + v.views, 0);
  const totalReports = myVideos.reduce((sum, v) => sum + v.reportCount, 0);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-border bg-card/40 p-6 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="w-full max-w-xs">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5" />
              Storage
            </span>
            <span className="tabular-nums text-muted-foreground">
              {currentUserStorage.usedGb} / {currentUserStorage.totalGb} GB
            </span>
          </div>
          <Progress value={storagePct} className="h-1.5" />
        </div>
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => {
          const next = value as TabValue;
          router.replace(next === "dashboard" ? "/me" : `/me?tab=${next}`, { scroll: false });
        }}
      >
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="videos">My Videos</TabsTrigger>
          <TabsTrigger value="uploads">Upload History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: "Total videos", value: myVideos.length },
              { label: "Total views", value: formatCount(totalViews) },
              { label: "Storage used", value: `${storagePct}%` },
              { label: "Flagged for review", value: totalReports, accent: totalReports > 0 },
            ].map((s) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-xl border border-border bg-card/50 p-4",
                  s.accent && "border-destructive/30 bg-destructive/5",
                )}
              >
                <p className={cn("text-2xl font-semibold tabular-nums", s.accent && "text-destructive")}>
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card/40 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Recent uploads
              </h2>
              <Button
                render={<Link href="/upload" />}
                nativeButton={false}
                size="sm"
                className="gap-1.5 bg-gradient-brand text-white hover:opacity-90"
              >
                <UploadIcon className="h-3.5 w-3.5" />
                Upload a video
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {recentUploads.slice(0, 3).map((v) => (
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
                  <Badge variant={statusVariant[v.status]} className="shrink-0 h-4 px-1.5 text-[10px] capitalize">
                    {v.status}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="flex flex-col gap-2">
          {myVideos.map((v) => (
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
                    {formatCount(v.views)}
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

              <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                <button
                  onClick={() =>
                    setVisibility((prev) => {
                      const next = !prev[v.id];
                      toast(next ? "Video set to public" : "Video set to private");
                      return { ...prev, [v.id]: next };
                    })
                  }
                  className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-border-strong"
                >
                  {visibility[v.id] ? <Globe2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  {visibility[v.id] ? "Public" : "Private"}
                </button>

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
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Edit ${v.title}`}
                  className="text-muted-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${v.title}`}
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => toast.error(`"${v.title}" deleted`)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="uploads" className="flex flex-col gap-2">
          {recentUploads.map((v) => (
            <div
              key={v.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card/40 p-2.5"
            >
              <Link href={`/v/${v.shareToken}`} className="h-12 w-20 shrink-0 overflow-hidden rounded-lg">
                <VideoThumb gradient={v.thumbnailGradient} duration={v.durationSeconds} className="rounded-lg" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{v.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Uploaded {timeAgo(v.createdAt)}</span>
                  <span>{formatFileSize(v.fileSizeMb)}</span>
                  {v.reportCount > 0 && (
                    <span className="flex items-center gap-1 text-destructive">
                      <Flag className="h-3 w-3" />
                      {v.reportCount} {v.reportCount === 1 ? "report" : "reports"}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant={statusVariant[v.status]} className="shrink-0 h-4 px-1.5 text-[10px] capitalize">
                {v.status}
              </Badge>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="settings" className="max-w-lg">
          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card/40 p-5">
            <div>
              <Label className="mb-1.5 text-xs text-muted-foreground">Email</Label>
              <Input defaultValue="demo.user@swimmyfile.io" disabled />
            </div>
            <div>
              <Label className="mb-1.5 text-xs text-muted-foreground">Password</Label>
              <Button variant="outline" size="sm" className="gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                Change password
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
              <span className="flex items-center gap-2 text-sm">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Email notifications
              </span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-destructive">Delete account</p>
                <p className="text-xs text-muted-foreground">Permanently remove your account and videos.</p>
              </div>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MyPage() {
  return (
    <AppShell>
      <RequireUser>
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <MyPageContent />
        </Suspense>
      </RequireUser>
    </AppShell>
  );
}

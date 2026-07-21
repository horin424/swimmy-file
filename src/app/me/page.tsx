"use client";

import { useState } from "react";
import Link from "next/link";
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
import { videos, formatCount, formatFileSize, expiresIn, currentUserStorage } from "@/lib/mock-data";
import type { VideoStatus } from "@/lib/types";
import { toast } from "sonner";

const statusVariant: Record<VideoStatus, "secondary" | "outline" | "destructive"> = {
  active: "secondary",
  processing: "outline",
  hidden: "outline",
  removed: "destructive",
};

export default function MyPage() {
  const myVideos = videos.slice(0, 7);
  const [visibility, setVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(myVideos.map((v) => [v.id, v.visibility === "public"])),
  );

  const storagePct = Math.round((currentUserStorage.usedGb / currentUserStorage.totalGb) * 100);
  const totalViews = myVideos.reduce((sum, v) => sum + v.views, 0);

  return (
    <AppShell>
      <RequireUser>
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
  
          <Tabs defaultValue="videos">
            <TabsList className="mb-6">
              <TabsTrigger value="videos">My Videos</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
  
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
      </RequireUser>
    </AppShell>
  );
}

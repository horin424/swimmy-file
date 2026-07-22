"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { RequireUser } from "@/components/require-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UploadCloud,
  Film,
  X,
  Globe2,
  Lock,
  Info,
  HardDrive,
  CircleCheck,
} from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { categories, currentUserStorage } from "@/lib/mock-data";
import { useSession } from "@/lib/session";
import { toast } from "sonner";

interface UploadItem {
  id: string;
  name: string;
  sizeLabel: string;
  progress: number;
  gradient: [string, string];
  thumbnailUrl?: string;
  thumbnailStatus: "pending" | "ready" | "failed";
}

// New-account policy: 2GB per file (see currentUserStorage note below / terms page).
const MAX_FILE_SIZE_BYTES = 2 * 1024 ** 3;

// Client-side stand-in for the server-side thumbnail pipeline (Lambda/FFmpeg,
// per the design doc) so uploaders get an instant preview. Seeks into the
// video element and grabs a single frame onto a canvas as a data URL. The
// real pipeline re-derives the canonical thumbnail server-side after upload
// completes; this is only ever a client preview, never the source of truth.
function generateClientThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => URL.revokeObjectURL(objectUrl);

    video.onloadedmetadata = () => {
      // Grab a frame ~1s in (or the midpoint for very short clips) so we
      // don't land on a black/blank first frame.
      video.currentTime = Math.min(1, video.duration / 2 || 0);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no 2d context");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        cleanup();
        resolve(dataUrl);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("failed to load video for thumbnail capture"));
    };
  });
}

export default function UploadPage() {
  const { user } = useSession();
  const emailVerified = user?.emailVerified ?? true;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<UploadItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [tagsInput, setTagsInput] = useState("night, ocean");
  const [category, setCategory] = useState<string>(categories[4]?.slug ?? "");
  const [expiryDate, setExpiryDate] = useState("");
  const [published, setPublished] = useState(false);

  // Same wording as the sidebar/account-menu unverified-state notices, so
  // this reads as one consistent rule rather than a one-off upload message.
  const requireVerifiedEmail = useCallback(() => {
    if (!emailVerified) {
      toast.error("Email verification required — verify your email before uploading.");
      return false;
    }
    return true;
  }, [emailVerified]);

  // Only one video per upload session — selecting/dropping a file while one
  // is already staged replaces nothing; it's rejected so a second video can
  // never queue up alongside the first.
  const addFile = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      if (!requireVerifiedEmail()) return;
      if (file) {
        toast.error("Remove the current video before adding another.");
        return;
      }

      const f = fileList[0];
      if (fileList.length > 1) {
        toast("Only one video can be uploaded at a time — using the first file.");
      }
      if (f.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${f.name}" is ${formatBytes(f.size)} — the limit is 2GB per file.`);
        return;
      }

      const id = `${f.name}-${f.size}`;
      setFile({
        id,
        name: f.name,
        sizeLabel: formatBytes(f.size),
        progress: 0,
        gradient: ["oklch(0.6 0.16 250)", "oklch(0.4 0.14 300)"],
        thumbnailStatus: "pending",
      });

      const interval = setInterval(() => {
        setFile((prev) =>
          prev && prev.id === id ? { ...prev, progress: Math.min(100, prev.progress + Math.random() * 18 + 6) } : prev,
        );
      }, 350);
      setTimeout(() => clearInterval(interval), 3200);

      generateClientThumbnail(f)
        .then((thumbnailUrl) => {
          setFile((prev) => (prev && prev.id === id ? { ...prev, thumbnailUrl, thumbnailStatus: "ready" } : prev));
        })
        .catch(() => {
          setFile((prev) => (prev && prev.id === id ? { ...prev, thumbnailStatus: "failed" } : prev));
        });
    },
    [file, requireVerifiedEmail],
  );

  const storagePct = Math.round((currentUserStorage.usedGb / currentUserStorage.totalGb) * 100);
  const canPublish = Boolean(file) && title.trim().length > 0;

  if (published) {
    return (
      <AppShell>
        <RequireUser>
          <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
              <CircleCheck className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Video published</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              &ldquo;{title}&rdquo; is live. You can manage it anytime from My Files.
            </p>
            <Button
              render={<Link href="/me" />}
              nativeButton={false}
              className="mt-6 bg-gradient-brand text-white hover:opacity-90"
            >
              Go to My Files
            </Button>
          </div>
        </RequireUser>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <RequireUser>
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Upload Video</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload your video and get a shareable link instantly.
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground">
              <Info className="h-3.5 w-3.5" />
              How it works?
            </Button>
          </div>
  
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-6">
              {!file ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!requireVerifiedEmail()) return;
                    inputRef.current?.click();
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (emailVerified) setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    addFile(e.dataTransfer.files);
                  }}
                  className={cn(
                    "group relative flex min-h-[320px] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card px-6 py-16 text-center transition-colors",
                    dragging && "border-primary/60 bg-primary/5",
                    !emailVerified && "opacity-60",
                  )}
                >
                  <div className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl transition-opacity group-hover:opacity-80" />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand">
                    <UploadCloud className="h-8 w-8 text-white" />
                  </div>
                  <div className="relative">
                    <p className="text-lg font-medium">Drag &amp; drop your video here</p>
                    <p className="text-sm text-muted-foreground">or click to browse</p>
                  </div>
                  <p className="relative text-xs text-muted-foreground/70">
                    Supports MP4, MOV, MKV, WebM and more · Max file size 2GB · One video per upload
                  </p>
                  {!emailVerified && (
                    <p className="relative text-xs font-medium text-warning">Email verification required</p>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => addFile(e.target.files)}
                  />
                </button>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3">
                  <div
                    className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg"
                    style={{ background: `linear-gradient(155deg, ${file.gradient[0]}, ${file.gradient[1]})` }}
                  >
                    {file.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={file.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    ) : file.thumbnailStatus === "pending" ? (
                      <Film className="h-5 w-5 animate-pulse text-white/90" />
                    ) : (
                      <Film className="h-5 w-5 text-white/90" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {Math.round(file.progress)}%
                      </span>
                    </div>
                    <Progress value={file.progress} className="mt-1.5 h-1.5" />
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{file.sizeLabel}</span>
                      <span className="text-muted-foreground/50">·</span>
                      <span>
                        {file.thumbnailStatus === "pending" && "Generating thumbnail…"}
                        {file.thumbnailStatus === "ready" && "Thumbnail ready"}
                        {file.thumbnailStatus === "failed" && "Thumbnail unavailable"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    aria-label={`Remove ${file.name}`}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
  
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card/50 p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Upload Settings
              </h2>
  
              <div>
                <Label htmlFor="video-title" className="mb-2 text-xs text-muted-foreground">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="video-title"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your video a title"
                />
              </div>
  
              <div>
                <Label htmlFor="video-description" className="mb-2 text-xs text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="video-description"
                  rows={4}
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this video about? (optional)"
                />
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="video-tags" className="mb-2 text-xs text-muted-foreground">
                    Tags
                  </Label>
                  <Input
                    id="video-tags"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="gaming, tutorial, funny"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground/70">Comma-separated</p>
                </div>

                <div>
                  <Label className="mb-2 text-xs text-muted-foreground">Category</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v ?? "")}
                    items={Object.fromEntries(
                      categories
                        .filter((c) => c.slug !== "all" && c.slug !== "popular" && c.slug !== "new")
                        .map((c) => [c.slug, c.name]),
                    )}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((c) => c.slug !== "all" && c.slug !== "popular" && c.slug !== "new")
                        .map((c) => (
                          <SelectItem key={c.slug} value={c.slug}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 text-xs text-muted-foreground">Visibility</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setVisibility("public")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        visibility === "public"
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:border-border-strong",
                      )}
                    >
                      <Globe2 className="h-4 w-4" />
                      Public
                    </button>
                    <button
                      onClick={() => setVisibility("private")}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                        visibility === "private"
                          ? "border-primary/50 bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:border-border-strong",
                      )}
                    >
                      <Lock className="h-4 w-4" />
                      Private
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="video-expiry" className="mb-2 text-xs text-muted-foreground">
                    Expiry date
                  </Label>
                  <Input
                    id="video-expiry"
                    type="date"
                    value={expiryDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>
              <p className="-mt-3 text-xs text-muted-foreground/70">
                {visibility === "public"
                  ? "Public files can be discovered in Swimmy Ocean and search results."
                  : "Private files are only visible to people with the link."}
                {" "}
                {expiryDate ? "After the expiry date, the file and link will be deleted." : "Leave the expiry date blank to keep this file up indefinitely."}
              </p>

              <Button
                disabled={!canPublish}
                className="mt-1 w-full bg-gradient-brand text-white hover:opacity-90"
                onClick={() => {
                  if (!canPublish) return;
                  setPublished(true);
                  toast.success("Video published!");
                }}
              >
                Publish
              </Button>
              {!file ? (
                <p className="-mt-3 text-center text-xs text-muted-foreground/70">Add a video to continue.</p>
              ) : !title.trim() ? (
                <p className="-mt-3 text-center text-xs text-muted-foreground/70">Title is required to publish.</p>
              ) : null}
  
              <div className="rounded-xl border border-border bg-card p-3">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
                    <HardDrive className="h-3.5 w-3.5" />
                    Storage used
                  </span>
                  <span className="tabular-nums text-muted-foreground">
                    {currentUserStorage.usedGb} GB / {currentUserStorage.totalGb} GB
                  </span>
                </div>
                <Progress value={storagePct} className="h-1.5" />
                <p className="mt-2 text-xs text-muted-foreground/70">
                  New accounts: 5 uploads/day · 2GB per file · 10GB total.{" "}
                  <span className="text-primary">Upgrade for more</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </RequireUser>
    </AppShell>
  );
}

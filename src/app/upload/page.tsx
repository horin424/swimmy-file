"use client";

import { useCallback, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { categories, currentUserStorage } from "@/lib/mock-data";

interface UploadItem {
  id: string;
  name: string;
  sizeLabel: string;
  progress: number;
  gradient: [string, string];
}

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [tags, setTags] = useState<string[]>(["night", "ocean"]);
  const [tagDraft, setTagDraft] = useState("");

  const addFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const next: UploadItem[] = Array.from(files).map((f, i) => ({
      id: `${f.name}-${i}-${f.size}`,
      name: f.name,
      sizeLabel: formatBytes(f.size),
      progress: 0,
      gradient: i % 2 === 0 ? ["oklch(0.6 0.16 250)", "oklch(0.4 0.14 300)"] : ["oklch(0.65 0.2 20)", "oklch(0.3 0.1 260)"],
    }));
    setItems((prev) => [...next, ...prev]);
    next.forEach((item) => {
      const tick = () => {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, progress: Math.min(100, it.progress + Math.random() * 18 + 6) } : it,
          ),
        );
      };
      const interval = setInterval(() => {
        tick();
      }, 350);
      setTimeout(() => clearInterval(interval), 3200);
    });
  }, []);

  const addTag = () => {
    const v = tagDraft.trim().replace(/^#/, "");
    if (v && !tags.includes(v)) setTags((t) => [...t, v]);
    setTagDraft("");
  };

  const storagePct = Math.round((currentUserStorage.usedGb / currentUserStorage.totalGb) * 100);

  return (
    <AppShell>
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
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              className={cn(
                "group relative flex min-h-[320px] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card px-6 py-16 text-center transition-colors",
                dragging && "border-primary/60 bg-primary/5",
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
                Supports MP4, MOV, MKV, WebM and more · Max file size 50GB
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                multiple
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </button>

            {items.length > 0 && (
              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3">
                    <div
                      className="flex h-12 w-16 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `linear-gradient(155deg, ${item.gradient[0]}, ${item.gradient[1]})` }}
                    >
                      <Film className="h-5 w-5 text-white/90" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          {Math.round(item.progress)}%
                        </span>
                      </div>
                      <Progress value={item.progress} className="mt-1.5 h-1.5" />
                      <p className="mt-1 text-xs text-muted-foreground">{item.sizeLabel}</p>
                    </div>
                    <button
                      onClick={() => setItems((prev) => prev.filter((it) => it.id !== item.id))}
                      aria-label={`Remove ${item.name}`}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card/50 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Upload Settings
            </h2>

            <div>
              <Label className="mb-2 text-xs text-muted-foreground">Privacy</Label>
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
              <p className="mt-1.5 text-xs text-muted-foreground/70">
                {visibility === "public"
                  ? "Public files can be discovered in Swimmy Ocean and search results."
                  : "Private files are only visible to people with the link."}
              </p>
            </div>

            <div>
              <Label className="mb-2 text-xs text-muted-foreground">Expiration</Label>
              <Select
                defaultValue="7"
                items={{ "1": "1 day", "7": "7 days", "30": "30 days", "0": "No expiration" }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="0">No expiration</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1.5 text-xs text-muted-foreground/70">
                After expiration, the file and link will be deleted.
              </p>
            </div>

            <div>
              <Label className="mb-2 text-xs text-muted-foreground">Category</Label>
              <Select
                defaultValue={categories[4]?.slug}
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

            <div>
              <Label className="mb-2 text-xs text-muted-foreground">Tags (optional)</Label>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="gap-1 pr-1.5">
                    {t}
                    <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} aria-label={`Remove tag ${t}`}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag and press Enter"
              />
            </div>

            <Button
              disabled={items.length === 0}
              className="mt-1 w-full bg-gradient-brand text-white hover:opacity-90"
            >
              Publish
            </Button>

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
    </AppShell>
  );
}

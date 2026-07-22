"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { UploadCloud, Copy, Check, QrCode, ExternalLink, RotateCw, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { videos } from "@/lib/mock-data";
import { toast } from "sonner";

const MAX_FILE_SIZE_BYTES = 2 * 1024 ** 3;

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

type Stage = "idle" | "uploading" | "complete";

// Gofile-style: this IS the upload flow, not a CTA into one. No account
// required — matches the client's explicit "no signup required" direction.
// Fully mock for now (see bottom of file for what a real backend swaps in).
export function HomeUploadHero() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [progress, setProgress] = useState(0);
  const [shareToken, setShareToken] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Mirrors `progress` so the interval tick can check "did we just cross
  // 100?" synchronously, without a separate effect reacting to state.
  const progressRef = useRef(0);

  const displayUrl = shareToken ? `swimmyfile.io/v/${shareToken}` : "";
  const hrefUrl = shareToken ? `/v/${shareToken}` : "";

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setStage("idle");
    setFileName("");
    setFileSize(0);
    setProgress(0);
    progressRef.current = 0;
    setShareToken("");
    setQrDataUrl(null);
    setCopied(false);
  }, []);

  // Mock stand-in for the real POST /api/uploads response — picks an
  // existing demo video so "Open link" leads somewhere real instead of a
  // 404, until there's a backend that actually creates a video record.
  const finishUpload = useCallback(() => {
    const demo = videos[Math.floor(Math.random() * Math.min(videos.length, 12))];
    setShareToken(demo.shareToken);
    QRCode.toDataURL(`${window.location.origin}/v/${demo.shareToken}`, { margin: 1, width: 220 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null));
    setStage("complete");
  }, []);

  const startUpload = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`"${file.name}" is ${formatBytes(file.size)} — the limit is 2GB per file.`);
        return;
      }
      setFileName(file.name);
      setFileSize(file.size);
      setProgress(0);
      progressRef.current = 0;
      setStage("uploading");
      intervalRef.current = setInterval(() => {
        const next = Math.min(100, progressRef.current + Math.random() * 20 + 8);
        progressRef.current = next;
        setProgress(next);
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          finishUpload();
        }
      }, 350);
    },
    [finishUpload],
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`https://${displayUrl}`);
    } catch {
      // clipboard API unavailable — still show optimistic feedback in this prototype
    }
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  };

  if (stage === "uploading") {
    return (
      <div className="w-full rounded-3xl border border-border bg-card/60 px-6 py-10 text-center sm:py-12">
        <p className="text-lg font-medium">Uploading…</p>
        <p className="mt-3 truncate text-sm text-muted-foreground">{fileName}</p>
        <div className="mx-auto mt-5 max-w-md">
          <Progress value={progress} className="h-2" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {formatBytes((fileSize * progress) / 100)} / {formatBytes(fileSize)}
            </span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-6" onClick={reset}>
          Cancel
        </Button>
      </div>
    );
  }

  if (stage === "complete") {
    return (
      <div className="w-full rounded-3xl border border-border bg-card/60 px-6 py-10 text-center sm:py-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CircleCheck className="h-7 w-7" />
        </div>
        <p className="mt-4 text-xl font-semibold tracking-tight">Upload complete!</p>
        <p className="mt-1 text-sm text-muted-foreground">Your file is ready to share.</p>

        <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-xl border border-border bg-background/60 p-2 pl-4">
          <code className="flex-1 truncate text-left text-sm text-muted-foreground">{displayUrl}</code>
          <Button size="sm" onClick={handleCopy} className="shrink-0 gap-1.5 bg-gradient-brand text-white hover:opacity-90">
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Dialog open={qrOpen} onOpenChange={setQrOpen}>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setQrOpen(true)}>
              <QrCode className="h-3.5 w-3.5" />
              Show QR code
            </Button>
            <DialogContent className="text-center">
              <DialogHeader>
                <DialogTitle>Scan to open</DialogTitle>
                <DialogDescription>Open this file&apos;s link on another device.</DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center py-2">
                {qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrDataUrl} alt={`QR code for ${displayUrl}`} className="h-56 w-56 rounded-lg bg-white p-2" />
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                    Generating…
                  </div>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{displayUrl}</p>
            </DialogContent>
          </Dialog>

          <Button
            render={<Link href={hrefUrl} target="_blank" />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open link
          </Button>

          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={reset}>
            <RotateCw className="h-3.5 w-3.5" />
            Upload another file
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
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
          const file = e.dataTransfer.files[0];
          if (file) startUpload(file);
        }}
        className={cn(
          "group relative flex w-full flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card/60 px-6 py-16 text-center transition-colors sm:py-20",
          dragging && "border-primary/60 bg-primary/5",
        )}
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl transition-opacity group-hover:opacity-80" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-brand shadow-lg shadow-primary/20">
          <UploadCloud className="h-10 w-10 text-white" />
        </div>
        <div className="relative">
          <p className="text-2xl font-semibold tracking-tight sm:text-3xl">Drag &amp; Drop or Click to Upload</p>
          <p className="mt-2 text-sm text-muted-foreground">Upload your file, get a shareable link, and send it anywhere.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) startUpload(file);
          }}
        />
      </button>

      <div className="relative mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground/70">
        <span>Max file size: 2GB</span>
        <span aria-hidden className="text-muted-foreground/40">
          ·
        </span>
        <span>No signup required</span>
        <span aria-hidden className="text-muted-foreground/40">
          ·
        </span>
        <span>Share instantly</span>
        <span aria-hidden className="text-muted-foreground/40">
          ·
        </span>
        <Link href="/terms" className="text-primary hover:underline">
          Terms
        </Link>
        <span aria-hidden className="text-muted-foreground/40">
          ·
        </span>
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy
        </Link>
      </div>
    </div>
  );
}

// --- What a real backend needs to replace here -------------------------
// 1. startUpload: instead of a setInterval mock, request a presigned S3
//    PUT URL (e.g. POST /api/uploads/presigned-url), upload the file
//    directly to S3 tracking real progress (XHR/fetch upload events), then
//    notify the backend the upload finished so it can create the Video
//    record (storagePath, fileSize, mimeType) and kick off thumbnail
//    generation (Lambda/FFmpeg per the design doc).
// 2. The "upload finished" effect: replace the random `videos[...]` pick
//    with the real created Video's shareToken from that API response.
// 3. Anonymous uploads: decide/confirm with backend whether these are
//    tied to a session-less "guest owner" record or fully anonymous —
//    affects whether My Files can ever show files uploaded this way.

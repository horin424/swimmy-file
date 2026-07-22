"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  UploadCloud,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  RotateCw,
  CircleCheck,
  TriangleAlert,
  MailWarning,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatBytes } from "@/lib/utils";
import { GUEST_UPLOAD_LIMIT_BYTES } from "@/lib/upload-eligibility";
import { useUploadFlow } from "@/lib/use-upload-flow";
import { toast } from "sonner";

// Shared card shell every non-dropzone stage below renders into, so they
// all read as one consistent "state screen" rather than differently-shaped
// blocks bolted onto the hero.
function StateCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-3xl border border-border bg-card/60 px-6 py-10 text-center sm:py-12">
      {children}
    </div>
  );
}

export function HomeUploadHero() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const { state, selectFile, cancel, reset } = useUploadFlow();

  const handleCopy = async (displayUrl: string) => {
    try {
      await navigator.clipboard.writeText(`https://${displayUrl}`);
    } catch {
      // clipboard API unavailable — still show optimistic feedback in this prototype
    }
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  };

  if (state.stage === "checking") {
    return (
      <StateCard>
        <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-primary/20" />
        <p className="mt-4 text-sm text-muted-foreground">Checking upload availability…</p>
      </StateCard>
    );
  }

  if (state.stage === "uploading") {
    return (
      <StateCard>
        <p className="text-lg font-medium">Uploading…</p>
        <p className="mt-3 truncate text-sm text-muted-foreground">{state.fileName}</p>
        <div className="mx-auto mt-5 max-w-md">
          <Progress value={state.progress} className="h-2" />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {formatBytes((state.fileSizeBytes * state.progress) / 100)} / {formatBytes(state.fileSizeBytes)}
            </span>
            <span className="tabular-nums">{Math.round(state.progress)}%</span>
          </div>
        </div>
        <Button variant="outline" size="sm" className="mt-6" onClick={cancel}>
          Cancel
        </Button>
      </StateCard>
    );
  }

  if (state.stage === "complete") {
    const { result } = state;
    return (
      <StateCard>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CircleCheck className="h-7 w-7" />
        </div>
        <p className="mt-4 text-xl font-semibold tracking-tight">Upload complete!</p>
        <p className="mt-1 text-sm text-muted-foreground">Your file is ready to share.</p>

        <div className="mx-auto mt-6 flex max-w-md items-center gap-2 rounded-xl border border-border bg-background/60 p-2 pl-4">
          <code className="flex-1 truncate text-left text-sm text-muted-foreground">{result.displayUrl}</code>
          <Button
            size="sm"
            onClick={() => handleCopy(result.displayUrl)}
            className="shrink-0 gap-1.5 bg-gradient-brand text-white hover:opacity-90"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>

        <div className="mx-auto mt-4 grid max-w-md grid-cols-2 gap-x-4 gap-y-1.5 text-left text-xs text-muted-foreground sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground/60">File name</p>
            <p className="truncate text-foreground">{result.fileName}</p>
          </div>
          <div>
            <p className="text-muted-foreground/60">File size</p>
            <p className="text-foreground">{formatBytes(result.fileSizeBytes)}</p>
          </div>
          <div>
            <p className="text-muted-foreground/60">Expiration</p>
            <p className="text-foreground">{result.expiresLabel}</p>
          </div>
          <div>
            <p className="text-muted-foreground/60">Visibility</p>
            <p className="text-foreground">{result.visibility}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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
                {result.qrDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.qrDataUrl}
                    alt={`QR code for ${result.displayUrl}`}
                    className="h-56 w-56 rounded-lg bg-white p-2"
                  />
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                    Generating…
                  </div>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{result.displayUrl}</p>
            </DialogContent>
          </Dialog>

          <Button
            render={<Link href={result.hrefUrl} target="_blank" />}
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
      </StateCard>
    );
  }

  if (state.stage === "guest-limit-exceeded") {
    const isReactive = state.attemptedFileSizeBytes !== undefined;
    return (
      <StateCard>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/15 text-warning">
          <TriangleAlert className="h-7 w-7" />
        </div>
        <p className="mt-4 text-xl font-semibold tracking-tight">Guest upload limit reached</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          Create a free account to continue uploading and manage your files.
        </p>
        {state.attemptedFileSizeBytes !== undefined && (
          <p className="mt-3 text-xs text-muted-foreground/70">
            Remaining guest capacity: {formatBytes(state.eligibility.guestRemainingBytes)} · Selected file:{" "}
            {formatBytes(state.attemptedFileSizeBytes)}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button
            render={<Link href="/signup" />}
            nativeButton={false}
            size="sm"
            className="gap-1.5 bg-gradient-brand text-white hover:opacity-90"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Create account
          </Button>
          <Button render={<Link href="/login" />} nativeButton={false} variant="outline" size="sm" className="gap-1.5">
            <LogIn className="h-3.5 w-3.5" />
            Log in
          </Button>
          {isReactive && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={cancel}>
              Cancel
            </Button>
          )}
        </div>
      </StateCard>
    );
  }

  if (state.stage === "email-verification-required") {
    return (
      <StateCard>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/15 text-warning">
          <MailWarning className="h-7 w-7" />
        </div>
        <p className="mt-4 text-xl font-semibold tracking-tight">Verify your email to continue</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          Please verify your email to continue uploading.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button
            size="sm"
            className="bg-gradient-brand text-white hover:opacity-90"
            onClick={() => toast.success("Verification email sent")}
          >
            Resend verification email
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={cancel}>
            Cancel
          </Button>
        </div>
      </StateCard>
    );
  }

  if (state.stage === "error") {
    return (
      <StateCard>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <TriangleAlert className="h-7 w-7" />
        </div>
        <p className="mt-4 text-xl font-semibold tracking-tight">Upload failed</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{state.message}</p>
        <Button variant="outline" size="sm" className="mt-6" onClick={reset}>
          Try again
        </Button>
      </StateCard>
    );
  }

  // stage === "ready"
  const { eligibility } = state;
  const guestNote =
    eligibility.userType === "guest"
      ? `Guest uploads are available up to ${formatBytes(GUEST_UPLOAD_LIMIT_BYTES)} per IP (${formatBytes(eligibility.guestRemainingBytes)} remaining). Sign in to upload more and manage your files.`
      : null;

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
          if (file) selectFile(file);
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
          <p className="mt-2 text-sm text-muted-foreground">Drop a file below, get a link, and share it right away.</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) selectFile(file);
          }}
        />
      </button>

      <div className="relative mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground/70">
        <span>{guestNote ?? "Share instantly"}</span>
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

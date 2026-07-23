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
  Sparkles,
  Gauge,
} from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatBytes } from "@/lib/utils";
import { GUEST_UPLOAD_LIMIT_BYTES } from "@/lib/upload-eligibility";
import { useUploadFlow, type CompletedUpload, type DiscoverDetails } from "@/lib/use-upload-flow";
import { useSession } from "@/lib/session";
import { categories } from "@/lib/mock-data";
import { toast } from "sonner";

const discoverCategories = categories.filter((c) => c.slug !== "all" && c.slug !== "popular" && c.slug !== "new");

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

// Mode 2 (Publish to Discover) — optional, collapsed by default, and never
// blocks copying the share link above it (Mode 1/Quick Share already
// finished by the time this renders). Guests never see this at all; see
// the "Add details for Discover" call site in HomeUploadHero.
function DiscoverDetailsSection({
  result,
  onPublish,
}: {
  result: CompletedUpload;
  onPublish: (details: DiscoverDetails) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(result.displayTitle);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const canPublish = title.trim().length > 0 && category.length > 0;

  if (result.discoverEnabled) {
    return (
      <p className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-primary">
        <CircleCheck className="h-3.5 w-3.5" />
        Published to Discover
      </p>
    );
  }

  if (!open) {
    return (
      <div className="mt-5 flex flex-col items-center gap-1.5">
        <p className="text-sm text-muted-foreground">Want this file to appear in Discover?</p>
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => setOpen(true)}>
          <Sparkles className="h-3.5 w-3.5" />
          Add details for Discover
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-5 max-w-md rounded-xl border border-border bg-background/40 p-4 text-left">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Publish to Discover</p>
      <div className="flex flex-col gap-3">
        <div>
          <Label htmlFor="discover-title" className="mb-1.5 text-xs text-muted-foreground">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="discover-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this file a title"
          />
        </div>
        <div>
          <Label className="mb-1.5 text-xs text-muted-foreground">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={category}
            onValueChange={(v) => setCategory(v ?? "")}
            items={Object.fromEntries(discoverCategories.map((c) => [c.slug, c.name]))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {discoverCategories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="discover-description" className="mb-1.5 text-xs text-muted-foreground">
            Description
          </Label>
          <Textarea
            id="discover-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this file about? (optional)"
          />
        </div>
        <div>
          <Label htmlFor="discover-tags" className="mb-1.5 text-xs text-muted-foreground">
            Tags
          </Label>
          <Input
            id="discover-tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="gaming, tutorial, funny"
          />
          <p className="mt-1 text-xs text-muted-foreground/70">Comma-separated</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!canPublish}
          className="gap-1.5 bg-gradient-brand text-white hover:opacity-90"
          onClick={() => {
            onPublish({
              title: title.trim(),
              category,
              description: description.trim() || undefined,
              tags: tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            });
            toast.success("Published to Discover");
          }}
        >
          Publish to Discover
        </Button>
      </div>
    </div>
  );
}

export function HomeUploadHero() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const { state, selectFile, cancel, reset, publishToDiscover } = useUploadFlow();
  const { status } = useSession();

  const handleCopy = async (displayUrl: string) => {
    try {
      // displayUrl is already a full https:// URL (see use-upload-flow.ts).
      await navigator.clipboard.writeText(displayUrl);
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

        <div className="mx-auto mt-5 max-w-md text-left">
          {/* Full-width row of its own — a 4-up grid truncated this down to
              a handful of characters (e.g. "Guitar cover ses..."), which
              read as broken rather than just compact. Two-line clamp plus a
              title tooltip covers names too long to show in full. */}
          <div className="rounded-xl border border-border bg-background/40 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground/70">File name</p>
            <p
              className="mt-0.5 line-clamp-2 break-words text-sm font-semibold text-foreground"
              title={result.displayTitle}
            >
              {result.displayTitle}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground/70">File size</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{formatBytes(result.fileSizeBytes)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground/70">Expiration</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{result.expiresLabel}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground/70">Visibility</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{result.visibility}</p>
            </div>
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

        {/* Mode 2 (Publish to Discover) — guests never get this, matching
            "hide Publish to Discover for guests" in the product direction;
            they already got their Quick Share link above, which is the
            whole point of the guest flow. */}
        {status === "authenticated" && (
          <DiscoverDetailsSection result={result} onPublish={publishToDiscover} />
        )}
      </StateCard>
    );
  }

  if (state.stage === "guest-limit-exceeded") {
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
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={cancel}>
            Cancel
          </Button>
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

      {eligibility.userType === "guest" ? (
        // Business-critical constraint — a small muted footer line was easy
        // to miss, so this gets card-level visual weight instead.
        <div className="mx-auto mt-4 flex max-w-md items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left">
          <Gauge className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Guest upload: {formatBytes(eligibility.guestRemainingBytes)} remaining /{" "}
              {formatBytes(GUEST_UPLOAD_LIMIT_BYTES)} per IP
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>{" "}
              to upload more and manage your files.
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Signed in — uploads are saved to{" "}
          <Link href="/me" className="font-medium text-primary hover:underline">
            My Page
          </Link>
          . Manage links, expiration, and visibility anytime.
        </p>
      )}

      <div className="relative mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground/70">
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

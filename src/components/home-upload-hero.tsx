"use client";

import { useState } from "react";
import Link from "next/link";
import {
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
import { formatBytes } from "@/lib/utils";
import { fileTypeLabel } from "@/lib/file-type";
import { GUEST_UPLOAD_LIMIT_BYTES } from "@/lib/upload-eligibility";
import { useMultiFileUploadFlow, type CompletedPackage, type DiscoverDetails } from "@/lib/use-multi-file-upload-flow";
import { MultiFileUploadDropzone } from "@/components/multi-file-upload-dropzone";
import { SelectedFileList } from "@/components/selected-file-list";
import { UploadProgressList } from "@/components/upload-progress-list";
import { DownloadZipButton } from "@/components/download-zip-button";
import { canDownloadZip } from "@/lib/package-zip";
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
// finished by the time this renders). Operates on the *package* as a whole,
// not per file: one title/category/description/tag set describes everything
// in the share, matching the "one shared package = one Discover card"
// product direction — there's no per-file metadata UI here, deliberately.
// Guests/unverified users never see this form at all; see the call sites in
// HomeUploadHero for the account-gated variants shown instead.
function DiscoverDetailsSection({
  result,
  onPublish,
}: {
  result: CompletedPackage;
  onPublish: (details: DiscoverDetails) => void;
}) {
  const [open, setOpen] = useState(false);
  // Deliberately NOT pre-filled from result.title — that default is derived
  // from the files themselves (a single file's name, or "N files"), which
  // reads as a meaningless Discover title ("3 files"). The user has to type
  // something real; the field starts empty with a placeholder instead.
  const [title, setTitle] = useState("");
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
      <div className="mx-auto mt-5 max-w-md rounded-xl border border-border/60 bg-background/30 p-4 text-center">
        <p className="text-sm text-muted-foreground">Want this upload to appear in Discover?</p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Add title, category, and tags before publishing publicly.
        </p>
        <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setOpen(true)}>
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
            Shared upload title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="discover-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give this shared upload a title"
          />
          <p className="mt-1 text-xs text-muted-foreground/70">
            This title represents the whole shared package, not each individual file.
          </p>
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
          <p className="mt-1 text-xs text-muted-foreground/70">Choose the best category for this shared upload.</p>
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
            placeholder="What's in this upload? (optional)"
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
            placeholder="tutorial, music, travel"
          />
          <p className="mt-1 text-xs text-muted-foreground/70">Add tags that describe the shared package.</p>
        </div>

        <p className="text-xs text-muted-foreground/70">
          For Discover, publish related files together. If your files are unrelated, create separate shared uploads.
        </p>
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
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const { state, addFiles, removeFile, startUpload, cancel, reset, publishToDiscover } = useMultiFileUploadFlow();
  const { status, user } = useSession();

  const handleFilesSelected = (files: File[]) => {
    const { skipped } = addFiles(files);
    if (skipped.length > 0) {
      toast.error(
        `${skipped.map((n) => `"${n}"`).join(", ")} ${skipped.length === 1 ? "is" : "are"} over the 2GB per-file limit and ${skipped.length === 1 ? "was" : "were"} skipped.`,
      );
    }
  };

  const handleCopy = async (displayUrl: string) => {
    try {
      // displayUrl is already a full https:// URL (see use-multi-file-upload-flow.ts).
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
        <UploadProgressList files={state.files} overallProgress={state.overallProgress} onCancel={cancel} />
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
        <p className="mt-1 text-sm text-muted-foreground">Your files are ready to share.</p>

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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground/70">Files</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{result.fileCount}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground/70">Total size</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{formatBytes(result.totalSizeBytes)}</p>
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

          <p className="mt-2 text-xs text-muted-foreground/70">
            {result.visibility === "Public"
              ? "Anyone can find this upload on Discover."
              : "Only people with this link can access these files."}
          </p>

          {/* Full file list — soft border/bg (vs. the URL field's stronger
              border above) so the two don't visually compete. Numbered so
              identically-named files (duplicate uploads) read as distinct
              rows rather than a rendering glitch. */}
          <div className="mt-3 rounded-xl border border-border/40 bg-background/20 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground/70">Files</p>
            <ul className="mt-1.5 flex flex-col gap-2">
              {result.files.map((f, i) => (
                <li key={i} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium text-foreground" title={f.fileName}>
                    {i + 1}. {f.fileName}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {fileTypeLabel(f.fileType)} · {formatBytes(f.fileSizeBytes)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Priority order: Copy link (already handled in the pill above),
            Open link, Download all as ZIP, Show QR code, Upload another
            package. Open link is outlined in primary so it reads a step
            above the plain-outline buttons next to it without competing
            with the gradient Copy link button. */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <Button
            render={<Link href={result.hrefUrl} target="_blank" />}
            nativeButton={false}
            variant="outline"
            size="sm"
            className="gap-1.5 border-primary/40 text-primary hover:bg-primary/5"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open link
          </Button>

          {canDownloadZip(result) && (
            <DownloadZipButton shareToken={result.shareToken} title={result.title} totalSizeBytes={result.totalSizeBytes} />
          )}

          <Dialog open={qrOpen} onOpenChange={setQrOpen}>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setQrOpen(true)}>
              <QrCode className="h-3.5 w-3.5" />
              Show QR code
            </Button>
            <DialogContent className="text-center">
              <DialogHeader>
                <DialogTitle>Scan to open</DialogTitle>
                <DialogDescription>Open this upload&apos;s link on another device.</DialogDescription>
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

          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={reset}>
            <RotateCw className="h-3.5 w-3.5" />
            Upload another package
          </Button>
        </div>

        {/* Mode 2 (Publish to Discover). Guests and unverified accounts each
            get a scaled-down variant that sells the account/verification
            instead of the form — neither can actually publish, so showing
            the full title/category/tags form would just dead-end at a gate
            later. Only a verified, logged-in user gets the real form. */}
        {status === "authenticated" && user?.emailVerified && (
          <DiscoverDetailsSection result={result} onPublish={publishToDiscover} />
        )}
        {status === "authenticated" && user && !user.emailVerified && (
          <div className="mx-auto mt-5 max-w-md rounded-xl border border-border/60 bg-background/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">Verify your email to publish this upload to Discover.</p>
            <Button
              size="sm"
              className="mt-3 gap-1.5 bg-gradient-brand text-white hover:opacity-90"
              onClick={() => toast.success("Verification email sent")}
            >
              <MailWarning className="h-3.5 w-3.5" />
              Resend verification email
            </Button>
          </div>
        )}
        {status === "guest" && (
          <div className="mx-auto mt-5 max-w-md rounded-xl border border-border/60 bg-background/30 p-4 text-center">
            <p className="text-sm text-muted-foreground">Want this upload to appear in Discover?</p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Create a free account to publish public uploads and manage your files.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
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
            </div>
          </div>
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
        {state.attemptedTotalBytes !== undefined && (
          <p className="mt-3 text-xs text-muted-foreground/70">
            Remaining guest capacity: {formatBytes(state.eligibility.guestRemainingBytes)} · Selected files total:{" "}
            {formatBytes(state.attemptedTotalBytes)}
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

  // state.stage is "ready" or "selecting" at this point — the dropzone
  // (nothing chosen yet) and the review list (one or more files chosen,
  // not yet uploading) share the same guest/auth note and footer below.
  const { eligibility } = state;
  const selectedTotalBytes = state.stage === "selecting" ? state.files.reduce((sum, f) => sum + f.file.size, 0) : 0;

  return (
    <div className="w-full">
      {state.stage === "ready" ? (
        <MultiFileUploadDropzone onFilesSelected={handleFilesSelected} />
      ) : (
        <SelectedFileList
          files={state.files}
          onAddMore={handleFilesSelected}
          onRemove={removeFile}
          onStartUpload={startUpload}
          onCancel={cancel}
        />
      )}

      {eligibility.userType === "guest" ? (
        // Business-critical constraint — a small muted footer line was easy
        // to miss, so this gets card-level visual weight instead.
        <div className="mx-auto mt-4 flex max-w-md items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left">
          <Gauge className="h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Guest uploads: {formatBytes(eligibility.guestRemainingBytes)} remaining /{" "}
              {formatBytes(GUEST_UPLOAD_LIMIT_BYTES)} per IP
            </p>
            {state.stage === "selecting" && (
              <p className="mt-0.5 text-xs text-foreground">
                Selected total: {formatBytes(selectedTotalBytes)} · Remaining after upload:{" "}
                {formatBytes(Math.max(0, eligibility.guestRemainingBytes - selectedTotalBytes))}
              </p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              Guest uploads are available up to 1GB per IP.{" "}
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

"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatBytes } from "@/lib/utils";
import { useDownloadPackageZip } from "@/lib/package-zip";
import { toast } from "sonner";

// "Download all as ZIP" for a multi-file package — see lib/package-zip.ts
// for the size-tier rules (direct / confirm-first / unavailable) and the
// mock request this drives. Callers should gate rendering on
// canDownloadZip() themselves (single-file packages just show the one
// Download button instead), since the "unavailable" (too-large) message
// still needs to render *something* here even when the button itself can't.
export function DownloadZipButton({
  shareToken,
  title,
  totalSizeBytes,
  variant = "outline",
}: {
  shareToken: string;
  title?: string;
  totalSizeBytes: number;
  variant?: "default" | "outline";
}) {
  const { state, availability, start, confirm, cancel } = useDownloadPackageZip({ shareToken, title, totalSizeBytes });

  if (availability.status === "unavailable") {
    return <p className="text-xs text-muted-foreground/70">{availability.reason}</p>;
  }

  const preparing = state.stage === "preparing";

  return (
    <>
      <Button
        size="sm"
        variant={variant}
        disabled={preparing}
        className="gap-1.5"
        onClick={async () => {
          const started = await start();
          if (started) toast.success("ZIP download started");
        }}
      >
        {preparing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        {preparing ? "Preparing ZIP..." : "Download all as ZIP"}
      </Button>
      {state.stage === "error" && <p className="mt-1.5 text-xs text-destructive">{state.message}</p>}

      <Dialog open={state.stage === "confirming"} onOpenChange={(open) => !open && cancel()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prepare ZIP download?</DialogTitle>
            <DialogDescription>
              This package is {formatBytes(totalSizeBytes)}. Preparing a ZIP may take time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-brand text-white hover:opacity-90"
              onClick={async () => {
                const started = await confirm();
                if (started) toast.success("ZIP download started");
              }}
            >
              Prepare ZIP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

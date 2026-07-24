"use client";

import { CircleCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import type { UploadingFile } from "@/lib/use-multi-file-upload-flow";

// Files upload one at a time (see use-multi-file-upload-flow.ts) so the
// per-row status always reads as Complete -> Uploading -> Waiting in file
// order, alongside one size-weighted overall progress bar.
export function UploadProgressList({
  files,
  overallProgress,
  onCancel,
}: {
  files: UploadingFile[];
  overallProgress: number;
  onCancel: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-md text-left">
      <p className="text-center text-lg font-medium">
        Uploading {files.length} {files.length === 1 ? "file" : "files"}...
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall progress</span>
          <span className="tabular-nums">{Math.round(overallProgress)}%</span>
        </div>
        <Progress value={overallProgress} className="mt-1.5 h-2" />
      </div>

      <ul className="mt-5 flex max-h-72 flex-col gap-2 overflow-y-auto">
        {files.map((f) => (
          <li key={f.id} className="rounded-lg border border-border/50 bg-background/30 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-foreground" title={f.fileName}>
                {f.fileName}
              </p>
              {f.status === "complete" ? (
                <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                  <CircleCheck className="h-3.5 w-3.5" />
                  Complete
                </span>
              ) : f.status === "uploading" ? (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  Uploading... {Math.round(f.progress)}%
                </span>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground/70">Waiting</span>
              )}
            </div>
            {f.status !== "waiting" && <Progress value={f.progress} className="mt-1.5 h-1" />}
            <p className="mt-1 text-xs text-muted-foreground/70">{formatBytes(f.fileSizeBytes)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex justify-center">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

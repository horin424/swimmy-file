"use client";

import { useState } from "react";
import { Play, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DownloadButton } from "@/components/download-button";
import { fileTypeLabel } from "@/lib/file-type";
import { formatBytes } from "@/lib/utils";
import type { PackageFile } from "@/lib/types";

// One row in a shared package's file list — Preview is only offered for
// types that actually have something to show (video/image); everything
// else (document/audio/archive/other) just gets Download.
export function PackageFileRow({ index, file }: { index: number; file: PackageFile }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const canPreview = (file.fileType === "VIDEO" || file.fileType === "IMAGE") && file.thumbnailGradient;

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/20 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground" title={file.displayName}>
          {index}. {file.displayName}
        </p>
        <p className="text-xs text-muted-foreground">
          {fileTypeLabel(file.fileType)} · {formatBytes(file.fileSizeBytes)}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {canPreview && (
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              Preview
            </Button>
            <DialogContent className="text-center">
              <DialogHeader>
                <DialogTitle className="truncate">{file.displayName}</DialogTitle>
                <DialogDescription>{fileTypeLabel(file.fileType)} preview</DialogDescription>
              </DialogHeader>
              <div
                className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg"
                style={{
                  background: file.thumbnailGradient
                    ? `linear-gradient(155deg, ${file.thumbnailGradient[0]}, ${file.thumbnailGradient[1]})`
                    : undefined,
                }}
              >
                {file.fileType === "VIDEO" ? (
                  <Play className="h-10 w-10 fill-white text-white" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-white" />
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
        <DownloadButton fileName={file.displayName} />
      </div>
    </li>
  );
}

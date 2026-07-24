"use client";

import { useRef } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { fileTypeLabel } from "@/lib/file-type";
import type { SelectedFile } from "@/lib/use-multi-file-upload-flow";

// Review step between selecting files and starting the upload — lets the
// user drop a mis-added file, add more, or back out entirely before any
// simulated network activity starts. No title/category/tags here: Quick
// Share needs none of that (see "Add details for Discover" post-upload).
export function SelectedFileList({
  files,
  onAddMore,
  onRemove,
  onStartUpload,
  onCancel,
}: {
  files: SelectedFile[];
  onAddMore: (files: File[]) => void;
  onRemove: (id: string) => void;
  onStartUpload: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalBytes = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card/60 p-5 text-left">
      <p className="text-sm font-semibold text-foreground">
        {files.length} {files.length === 1 ? "file" : "files"} selected
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">Total size: {formatBytes(totalBytes)}</p>

      <ul className="mt-4 flex max-h-64 flex-col gap-1.5 overflow-y-auto">
        {files.map((sf) => (
          <li
            key={sf.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/50 bg-background/30 px-3 py-2"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground" title={sf.file.name}>
                {sf.file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {fileTypeLabel(sf.fileType)} · {formatBytes(sf.file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemove(sf.id)}
              aria-label={`Remove ${sf.file.name}`}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => inputRef.current?.click()}>
          <Plus className="h-3.5 w-3.5" />
          Add more files
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" className="gap-1.5 bg-gradient-brand text-white hover:opacity-90" onClick={onStartUpload}>
            Start upload
          </Button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onAddMore(Array.from(e.target.files));
          e.target.value = "";
        }}
      />
    </div>
  );
}

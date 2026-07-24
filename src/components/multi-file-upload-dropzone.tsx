"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

// The "ready" state's dropzone box — select or drop one or more files of
// any type (Gofile/GigaFire-style file sharing, not a video-only uploader).
// Purely presentational: file validation (size caps, guest quota) happens
// one level up in useMultiFileUploadFlow, since it needs eligibility state
// this component doesn't have.
export function MultiFileUploadDropzone({ onFilesSelected }: { onFilesSelected: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
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
        if (e.dataTransfer.files.length > 0) onFilesSelected(Array.from(e.dataTransfer.files));
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
        <p className="text-2xl font-semibold tracking-tight sm:text-3xl">Drag &amp; Drop files or Click to Upload</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Upload one or more files, get a single share link, and send it anywhere.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) onFilesSelected(Array.from(e.target.files));
          // Reset so selecting the exact same file(s) again later (e.g. after
          // removing one and re-adding it via "Add more files") still fires onChange.
          e.target.value = "";
        }}
      />
    </button>
  );
}

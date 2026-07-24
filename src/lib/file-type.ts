import type { FileType } from "./types";

// Client-side stand-in for a real backend's mime-sniffing — good enough to
// classify a selected File by its browser-reported mimeType for display
// purposes (icon/label), not a security boundary.
export function detectFileType(mimeType: string): FileType {
  if (mimeType.startsWith("video/")) return "VIDEO";
  if (mimeType.startsWith("image/")) return "IMAGE";
  if (mimeType.startsWith("audio/")) return "AUDIO";
  if (
    mimeType === "application/pdf" ||
    mimeType.startsWith("text/") ||
    mimeType.includes("document") ||
    mimeType.includes("msword") ||
    mimeType.includes("officedocument")
  ) {
    return "DOCUMENT";
  }
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("7z") || mimeType.includes("tar")) {
    return "ARCHIVE";
  }
  return "OTHER";
}

export function fileTypeLabel(type: FileType): string {
  switch (type) {
    case "VIDEO":
      return "Video";
    case "IMAGE":
      return "Image";
    case "AUDIO":
      return "Audio";
    case "DOCUMENT":
      return "Document";
    case "ARCHIVE":
      return "Archive";
    default:
      return "File";
  }
}

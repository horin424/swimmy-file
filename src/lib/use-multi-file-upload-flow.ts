"use client";

import { useCallback, useRef, useState } from "react";
import QRCode from "qrcode";
import { videos } from "./mock-data";
import { detectFileType } from "./file-type";
import { checkGuestUploadLimit, useUploadEligibility } from "./upload-eligibility";
import type { UploadEligibility, FileType } from "./types";

const MAX_FILE_SIZE_BYTES = 2 * 1024 ** 3; // per-file cap, independent of the guest cumulative cap (checked against the combined total)

export interface SelectedFile {
  id: string;
  file: File;
  fileType: FileType;
}

export interface UploadingFile {
  id: string;
  fileName: string;
  fileSizeBytes: number;
  fileType: FileType;
  progress: number; // 0-100
  status: "waiting" | "uploading" | "complete";
}

export interface CompletedPackageFile {
  fileName: string;
  fileSizeBytes: number;
  fileType: FileType;
}

// Mirrors the suggested POST /api/share-packages/complete response shape
// (shareToken/shareUrl/fileCount/totalSizeBytes) closely enough that the
// mock->real swap only touches where these values come from, not their
// shape — see the API notes in README-worthy comments below and in
// upload-eligibility.ts for the same pattern on GET /api/upload/eligibility.
export interface CompletedPackage {
  shareToken: string;
  displayUrl: string;
  hrefUrl: string;
  qrDataUrl: string | null;
  // Quick Share default: a name derived from the files themselves (single
  // file's own name, or "N files"). Editable via "Add details for Discover".
  title: string;
  files: CompletedPackageFile[];
  fileCount: number;
  totalSizeBytes: number;
  visibility: "Link only" | "Public";
  discoverEnabled: boolean;
  expiresLabel: string;
  category?: string;
  description?: string;
  tags?: string[];
}

export interface DiscoverDetails {
  title: string;
  category: string;
  description?: string;
  tags?: string[];
  expiresLabel?: string;
}

export type UploadFlowState =
  | { stage: "checking" }
  | { stage: "ready"; eligibility: UploadEligibility }
  | { stage: "selecting"; eligibility: UploadEligibility; files: SelectedFile[] }
  | { stage: "uploading"; files: UploadingFile[]; overallProgress: number }
  | { stage: "complete"; result: CompletedPackage }
  | { stage: "guest-limit-exceeded"; eligibility: UploadEligibility; attemptedTotalBytes?: number }
  | { stage: "email-verification-required" }
  | { stage: "error"; message: string };

// What the UI would show if nothing had reactively overridden it — i.e.
// purely a function of the current eligibility check. Computed during
// render (not synced via an effect) since it's a pure derivation, not a
// side effect.
function deriveEligibilityStage(loading: boolean, eligibility: UploadEligibility): UploadFlowState {
  if (loading) return { stage: "checking" };
  if (!eligibility.canUpload) {
    if (eligibility.userType === "guest") return { stage: "guest-limit-exceeded", eligibility };
    return { stage: "email-verification-required" };
  }
  return { stage: "ready", eligibility };
}

let idCounter = 0;
function makeFileId(): string {
  idCounter += 1;
  return `sel_${idCounter}_${Date.now().toString(36)}`;
}

// Encapsulates the entire multi-file upload lifecycle (eligibility check ->
// select one or more files -> review/remove/add more -> guest-limit/
// verification gates -> per-file progress -> one shared package link) so
// HomeUploadHero stays presentational. Everything below the "mock" comments
// is what a real backend (POST /api/share-packages/request then
// POST /api/share-packages/complete) replaces; the returned
// `state`/`addFiles`/`removeFile`/`startUpload`/`cancel`/`reset` contract
// doesn't need to change when that happens.
export function useMultiFileUploadFlow() {
  const { eligibility, loading, recordUpload } = useUploadEligibility();
  // null = "nothing has reactively taken over yet, just show whatever
  // eligibility derives to". Non-null = selecting/uploading/complete/a
  // reactively-triggered gate/error — anything the user's own action
  // caused, which a background eligibility refresh must never silently
  // clear out from under them.
  const [override, setOverride] = useState<UploadFlowState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Mutable working copies used only while "uploading" is in flight — kept
  // outside React state so the interval tick always reads/writes the latest
  // values instead of a stale closure, mirroring the progressRef pattern
  // from the single-file version of this hook.
  const filesRef = useRef<UploadingFile[]>([]);
  const currentIndexRef = useRef(0);
  const totalBytesRef = useRef(0);

  const state = override ?? deriveEligibilityStage(loading, eligibility);

  const cancel = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setOverride(null);
  }, []);

  // Same underlying action as cancel — separate name so call sites ("Try
  // again" after an error, "Upload another package" after completing) read
  // as what they mean rather than reusing "cancel" out of context.
  const reset = cancel;

  // Used both for the first selection (from "ready") and "Add more files"
  // (from "selecting") — same validation either way. Returns the names of
  // any files rejected for being over the per-file cap so the caller can
  // surface a toast; oversized files never block the rest of the selection.
  const addFiles = useCallback(
    (incoming: File[]): { skipped: string[] } => {
      if (incoming.length === 0) return { skipped: [] };
      if (state.stage !== "ready" && state.stage !== "selecting") return { skipped: [] };

      const skipped: string[] = [];
      const accepted: SelectedFile[] = [];
      for (const f of incoming) {
        if (f.size > MAX_FILE_SIZE_BYTES) {
          skipped.push(f.name);
          continue;
        }
        accepted.push({ id: makeFileId(), file: f, fileType: detectFileType(f.type) });
      }
      if (accepted.length === 0) return { skipped };

      const prevFiles = state.stage === "selecting" ? state.files : [];
      setOverride({ stage: "selecting", eligibility: state.eligibility, files: [...prevFiles, ...accepted] });
      return { skipped };
    },
    [state],
  );

  const removeFile = useCallback((id: string) => {
    setOverride((prev) => {
      if (prev?.stage !== "selecting") return prev;
      const files = prev.files.filter((f) => f.id !== id);
      // Nothing left to review — drop back to the plain dropzone instead of
      // showing an empty "0 files selected" list.
      if (files.length === 0) return null;
      return { ...prev, files };
    });
  }, []);

  const startUpload = useCallback(() => {
    if (state.stage !== "selecting" || state.files.length === 0) return;
    const elig = state.eligibility;
    const selected = state.files;
    const totalBytes = selected.reduce((sum, sf) => sum + sf.file.size, 0);

    if (elig.userType === "user" && !elig.canUpload) {
      setOverride({ stage: "email-verification-required" });
      return;
    }
    if (elig.userType === "guest") {
      const { allowed } = checkGuestUploadLimit(elig.guestUsedBytes, totalBytes);
      if (!allowed) {
        setOverride({ stage: "guest-limit-exceeded", eligibility: elig, attemptedTotalBytes: totalBytes });
        return;
      }
    }

    const uploadingFiles: UploadingFile[] = selected.map((sf, idx) => ({
      id: sf.id,
      fileName: sf.file.name,
      fileSizeBytes: sf.file.size,
      fileType: sf.fileType,
      progress: 0,
      status: idx === 0 ? "uploading" : "waiting",
    }));
    filesRef.current = uploadingFiles;
    currentIndexRef.current = 0;
    totalBytesRef.current = totalBytes;
    setOverride({ stage: "uploading", files: uploadingFiles, overallProgress: 0 });

    intervalRef.current = setInterval(() => {
      const files = filesRef.current;
      const idx = currentIndexRef.current;
      const current = files[idx];
      if (!current) return;

      current.progress = Math.min(100, current.progress + Math.random() * 22 + 10);
      if (current.progress >= 100) {
        current.status = "complete";
        currentIndexRef.current += 1;
        const next = files[currentIndexRef.current];
        if (next) next.status = "uploading";
      }

      const totalDone = files.reduce((sum, f) => sum + (f.fileSizeBytes * f.progress) / 100, 0);
      const overallProgress = totalBytesRef.current > 0 ? (totalDone / totalBytesRef.current) * 100 : 100;
      setOverride({ stage: "uploading", files: [...files], overallProgress });

      if (currentIndexRef.current >= files.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;

        if (elig.userType === "guest") recordUpload(totalBytes);

        // Mock stand-in for the real POST /api/share-packages/complete
        // response — picks an existing demo package purely so the
        // generated link leads somewhere real instead of a 404, until
        // there's a backend that actually stores the uploaded files. The
        // file list/title/total size shown on the complete screen reflect
        // the real selected files (not the demo's), same reasoning as the
        // single-file version of this hook: the confirmation screen should
        // always name what the user actually just uploaded. (Opening the
        // resulting /d/[shareToken] link still shows that demo package's
        // own mock files — a known limitation of this no-backend
        // prototype, not something this screen can fix on its own.)
        const demo = videos[Math.floor(Math.random() * Math.min(videos.length, 12))];
        const shareToken = demo.shareToken;
        const resultFiles: CompletedPackageFile[] = selected.map((sf) => ({
          fileName: sf.file.name,
          fileSizeBytes: sf.file.size,
          fileType: sf.fileType,
        }));
        const defaultTitle = selected.length === 1 ? selected[0].file.name : `${selected.length} files`;
        const result: CompletedPackage = {
          shareToken,
          displayUrl: `https://swimmyfile.io/d/${shareToken}`,
          hrefUrl: `/d/${shareToken}`,
          qrDataUrl: null,
          title: defaultTitle,
          files: resultFiles,
          fileCount: resultFiles.length,
          totalSizeBytes: totalBytes,
          // Quick Share default — nobody explicitly chose to publish it to
          // Discover, so it stays link-only/unlisted.
          visibility: "Link only",
          discoverEnabled: false,
          expiresLabel: "Expires in 7 days",
        };
        setOverride({ stage: "complete", result });

        QRCode.toDataURL(`${window.location.origin}/d/${shareToken}`, { margin: 1, width: 220 })
          .then((qrDataUrl) => {
            setOverride((prev) =>
              prev?.stage === "complete" && prev.result.shareToken === shareToken
                ? { stage: "complete", result: { ...prev.result, qrDataUrl } }
                : prev,
            );
          })
          .catch(() => {
            /* QR is a nice-to-have; leave qrDataUrl null on failure */
          });
      }
    }, 300);
  }, [state, recordUpload]);

  // "Add details for Discover" — Mode 2 (Publish to Discover) per the Quick
  // Share / Publish to Discover split. Only meaningful once a package has
  // finished uploading; a no-op otherwise. Mock stand-in for a real
  // PATCH /api/share-packages/:shareToken/publish — same reasoning as
  // startUpload above.
  const publishToDiscover = useCallback((details: DiscoverDetails) => {
    setOverride((prev) =>
      prev?.stage === "complete"
        ? {
            stage: "complete",
            result: {
              ...prev.result,
              title: details.title,
              category: details.category,
              description: details.description,
              tags: details.tags,
              visibility: "Public",
              discoverEnabled: true,
              ...(details.expiresLabel ? { expiresLabel: details.expiresLabel } : null),
            },
          }
        : prev,
    );
  }, []);

  return { state, addFiles, removeFile, startUpload, cancel, reset, publishToDiscover };
}

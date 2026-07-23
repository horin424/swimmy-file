"use client";

import { useCallback, useRef, useState } from "react";
import QRCode from "qrcode";
import { formatBytes } from "./utils";
import { videos } from "./mock-data";
import { checkGuestUploadLimit, useUploadEligibility } from "./upload-eligibility";
import type { UploadEligibility } from "./types";

const MAX_FILE_SIZE_BYTES = 2 * 1024 ** 3; // per-file cap, independent of the guest cumulative cap

// Mirrors the suggested file metadata shape (id/shareToken/originalFileName/
// displayTitle/.../visibility LINK_ONLY|PUBLIC|PRIVATE/discoverEnabled/...)
// closely enough that the mock->real swap only touches where these values
// come from, not their shape. Quick Share sets displayTitle=originalFileName,
// visibility=LINK_ONLY, discoverEnabled=false; publishToDiscover() below is
// the only thing that ever changes them client-side.
export interface CompletedUpload {
  fileName: string; // original file name — immutable
  displayTitle: string; // editable via "Add details for Discover"; defaults to fileName
  fileSizeBytes: number;
  shareToken: string;
  displayUrl: string;
  hrefUrl: string;
  qrDataUrl: string | null;
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
  | { stage: "uploading"; fileName: string; fileSizeBytes: number; progress: number }
  | { stage: "complete"; result: CompletedUpload }
  | { stage: "guest-limit-exceeded"; eligibility: UploadEligibility; attemptedFileSizeBytes?: number }
  | { stage: "email-verification-required" }
  | { stage: "error"; message: string };

// What the UI would show if nothing had reactively overridden it — i.e.
// purely a function of the current eligibility check. Computed during
// render (not synced via an effect) since it's a pure derivation, not a
// side effect: "idle" only ever exists for the instant before the first
// eligibility read, which this collapses straight into "checking".
function deriveEligibilityStage(loading: boolean, eligibility: UploadEligibility): UploadFlowState {
  if (loading) return { stage: "checking" };
  if (!eligibility.canUpload) {
    if (eligibility.userType === "guest") return { stage: "guest-limit-exceeded", eligibility };
    return { stage: "email-verification-required" };
  }
  return { stage: "ready", eligibility };
}

// Encapsulates the entire upload lifecycle (eligibility check -> file
// select -> guest-limit/verification gates -> progress -> complete) so
// HomeUploadHero (and any future upload surface) stays presentational.
// Everything below the "mock" comments is what a real backend replaces;
// the returned `state`/`selectFile`/`cancel`/`reset` contract doesn't
// need to change when that happens.
export function useUploadFlow() {
  const { eligibility, loading, recordUpload } = useUploadEligibility();
  // null = "nothing has reactively taken over yet, just show whatever
  // eligibility derives to". Non-null = uploading/complete/a
  // reactively-triggered gate/error — anything the user's own action
  // caused, which a background eligibility refresh must never silently
  // clear out from under them.
  const [override, setOverride] = useState<UploadFlowState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);

  const state = override ?? deriveEligibilityStage(loading, eligibility);

  const cancel = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setOverride(null);
  }, []);

  // Same underlying action as cancel — separate name so call sites ("Try
  // again" after an error, "Upload another file" after completing) read as
  // what they mean rather than reusing "cancel" out of context.
  const reset = cancel;

  const selectFile = useCallback(
    (file: File) => {
      if (state.stage !== "ready") return;
      const elig = state.eligibility;

      if (elig.userType === "user" && !elig.canUpload) {
        setOverride({ stage: "email-verification-required" });
        return;
      }

      if (elig.userType === "guest") {
        const { allowed } = checkGuestUploadLimit(elig.guestUsedBytes, file.size);
        if (!allowed) {
          setOverride({ stage: "guest-limit-exceeded", eligibility: elig, attemptedFileSizeBytes: file.size });
          return;
        }
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setOverride({
          stage: "error",
          message: `"${file.name}" is ${formatBytes(file.size)} — the limit is 2GB per file.`,
        });
        return;
      }

      progressRef.current = 0;
      setOverride({ stage: "uploading", fileName: file.name, fileSizeBytes: file.size, progress: 0 });

      intervalRef.current = setInterval(() => {
        const next = Math.min(100, progressRef.current + Math.random() * 20 + 8);
        progressRef.current = next;
        setOverride((prev) => (prev?.stage === "uploading" ? { ...prev, progress: next } : prev));

        if (next < 100) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;

        if (elig.userType === "guest") recordUpload(file.size);

        // Mock stand-in for the real POST /api/upload/complete response —
        // picks an existing demo video so the generated link leads
        // somewhere real instead of a 404, until there's a backend that
        // actually creates a File/Video record. displayTitle/fileSizeBytes
        // intentionally come from that demo record, not the real selected
        // `file` — otherwise the complete screen would show one file name/
        // size while /d/[shareToken] (reading the demo's real mock data)
        // shows another, which is exactly the "opened link shows a
        // different file" inconsistency this is standing in to avoid.
        const demo = videos[Math.floor(Math.random() * Math.min(videos.length, 12))];
        const shareToken = demo.shareToken;
        const result: CompletedUpload = {
          fileName: file.name,
          // Quick Share default: displayTitle = originalFileName. Here
          // that's the demo's title (see comment above) — only "Add
          // details for Discover" (publishToDiscover, below) changes it
          // otherwise.
          displayTitle: demo.title,
          fileSizeBytes: demo.fileSizeMb * 1024 * 1024,
          shareToken,
          displayUrl: `https://swimmyfile.io/d/${shareToken}`,
          hrefUrl: `/d/${shareToken}`,
          qrDataUrl: null,
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
      }, 350);
    },
    [state, recordUpload],
  );

  // "Add details for Discover" — Mode 2 (Publish to Discover) per the
  // Quick Share / Publish to Discover split. Only meaningful once a Quick
  // Share upload has completed; a no-op otherwise. Mock stand-in for a real
  // PATCH /api/videos/:id/publish — same reasoning as finishUpload above.
  const publishToDiscover = useCallback((details: DiscoverDetails) => {
    setOverride((prev) =>
      prev?.stage === "complete"
        ? {
            stage: "complete",
            result: {
              ...prev.result,
              displayTitle: details.title,
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

  return { state, selectFile, cancel, reset, publishToDiscover };
}

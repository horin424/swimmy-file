"use client";

import { useCallback, useRef, useState } from "react";
import QRCode from "qrcode";
import { formatBytes } from "./utils";
import { videos } from "./mock-data";
import { checkGuestUploadLimit, useUploadEligibility } from "./upload-eligibility";
import type { UploadEligibility } from "./types";

const MAX_FILE_SIZE_BYTES = 2 * 1024 ** 3; // per-file cap, independent of the guest cumulative cap

export interface CompletedUpload {
  fileName: string;
  fileSizeBytes: number;
  shareToken: string;
  displayUrl: string;
  hrefUrl: string;
  qrDataUrl: string | null;
  visibility: "Private (link only)" | "Public";
  expiresLabel: string;
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
        // actually creates a File/Video record.
        const demo = videos[Math.floor(Math.random() * Math.min(videos.length, 12))];
        const shareToken = demo.shareToken;
        const result: CompletedUpload = {
          fileName: file.name,
          fileSizeBytes: file.size,
          shareToken,
          displayUrl: `swimmyfile.io/d/${shareToken}`,
          hrefUrl: `/d/${shareToken}`,
          qrDataUrl: null,
          // Anonymous/guest-style uploads default to link-only, not public —
          // nobody explicitly chose to publish it to Discover.
          visibility: "Private (link only)",
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

  return { state, selectFile, cancel, reset };
}

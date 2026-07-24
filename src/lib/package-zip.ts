"use client";

import { useCallback, useRef, useState } from "react";
import { formatBytes } from "./utils";
import { incrementZipDownloadCount } from "./recent-packages";

// --- Policy constants -------------------------------------------------
// Single source of truth for the size tiers below — nothing else in this
// feature should hardcode a byte threshold.

// Below this, ZIP prep is treated as fast enough to just start immediately
// (a real backend would do this synchronously — see the architecture notes
// on requestPackageZip below). At/above it, the user is asked to confirm
// first, since a real background job might take a while.
export const MAX_SYNC_ZIP_SIZE_BYTES = 1 * 1024 ** 3; // 1GB

// Hard ceiling for MVP — no ZIP generation is offered above this at all,
// regardless of confirmation. Individual downloads remain available.
export const MAX_ZIP_SIZE_BYTES = 5 * 1024 ** 3; // 5GB

export interface PackageZipResult {
  zipUrl: string;
  fileName: string;
  expiresAt: string;
}

export type ZipAvailability =
  | { status: "available"; needsConfirmation: boolean }
  | { status: "unavailable"; reason: string };

/** Whether "Download all as ZIP" makes sense for this package at all — multi-file only (see product direction: single-file packages just show the one Download button). */
export function canDownloadZip(pkg: { fileCount: number }): boolean {
  return pkg.fileCount > 1;
}

/** Size-tier classification against MAX_SYNC_ZIP_SIZE_BYTES/MAX_ZIP_SIZE_BYTES above. */
export function getZipAvailability(totalSizeBytes: number): ZipAvailability {
  if (totalSizeBytes > MAX_ZIP_SIZE_BYTES) {
    return {
      status: "unavailable",
      reason: `ZIP download is not available for packages over ${formatBytes(MAX_ZIP_SIZE_BYTES)} yet. Please download files individually.`,
    };
  }
  return { status: "available", needsConfirmation: totalSizeBytes >= MAX_SYNC_ZIP_SIZE_BYTES };
}

// Mirrors the suggested `swimmyfile-{slugified-title}.zip` /
// `swimmyfile-{shareToken}.zip` naming: sanitized (safe characters only)
// and length-capped so a long/weird package title can't produce an
// unwieldy download filename.
export function formatZipFileName(title: string | undefined, shareToken: string): string {
  const slug = (title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
    .slice(0, 60);
  return `swimmyfile-${slug || shareToken}.zip`;
}

// Mock stand-in for the real POST /api/share-packages/:shareToken/zip.
//
// Real backend flow (see the client's architecture notes):
//   1. Check package access/visibility/expiration.
//   2. If a valid ZIP already exists (see SharePackage.zipStatus/
//      zipStorageKey/zipExpiresAt in lib/types.ts and prisma/schema.prisma),
//      return its existing signed URL.
//   3. Otherwise generate it server-side (or via a background job for large
//      packages) from the files in S3, store it temporarily, and return a
//      signed/CloudFront URL — never ZIP in the browser.
//
// This mock simulates the same request/response shape and latency, and
// triggers a real browser download of a small placeholder blob so the
// button's success path (including the suggested filename) is fully
// exercisable without a backend. Swapping this one function for a real
// `fetch` is the entire migration — nothing above it needs to change.
async function requestPackageZip(shareToken: string, fileName: string): Promise<PackageZipResult> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new Error("You appear to be offline.");
  }

  await new Promise((resolve) => setTimeout(resolve, 1400));

  const blob = new Blob(
    [`Mock ZIP placeholder for package ${shareToken}.\nReal ZIP generation is not wired up to a backend yet.`],
    { type: "application/zip" },
  );
  return {
    zipUrl: URL.createObjectURL(blob),
    fileName,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  };
}

export type DownloadZipState =
  | { stage: "idle" }
  | { stage: "confirming" }
  | { stage: "preparing" }
  | { stage: "error"; message: string };

// Encapsulates the whole ZIP-download lifecycle (size-tier check -> optional
// confirmation -> prepare -> trigger browser download -> mock analytics) so
// DownloadZipButton stays presentational. `start`/`confirm` resolve to
// whether a download was actually triggered, so the caller can show a
// success toast without duplicating the state machine.
export function useDownloadPackageZip(pkg: { shareToken: string; title?: string; totalSizeBytes: number }) {
  const [state, setState] = useState<DownloadZipState>({ stage: "idle" });
  const inFlightRef = useRef(false);
  const availability = getZipAvailability(pkg.totalSizeBytes);

  const run = useCallback(async (): Promise<boolean> => {
    if (inFlightRef.current) return false; // guard against duplicate clicks
    inFlightRef.current = true;
    setState({ stage: "preparing" });
    try {
      const fileName = formatZipFileName(pkg.title, pkg.shareToken);
      const result = await requestPackageZip(pkg.shareToken, fileName);

      const a = document.createElement("a");
      a.href = result.zipUrl;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(result.zipUrl);

      incrementZipDownloadCount(pkg.shareToken);
      setState({ stage: "idle" });
      return true;
    } catch {
      setState({ stage: "error", message: "Failed to prepare ZIP. Please try again." });
      return false;
    } finally {
      inFlightRef.current = false;
    }
  }, [pkg.shareToken, pkg.title]);

  const start = useCallback(async (): Promise<boolean> => {
    if (availability.status === "unavailable") return false;
    if (availability.needsConfirmation) {
      setState({ stage: "confirming" });
      return false;
    }
    return run();
  }, [availability, run]);

  const confirm = useCallback((): Promise<boolean> => run(), [run]);

  const cancel = useCallback(() => setState({ stage: "idle" }), []);

  return { state, availability, start, confirm, cancel };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "./session";
import type { UploadEligibility } from "./types";

// --- Policy constants -----------------------------------------------------

export const GUEST_UPLOAD_LIMIT_BYTES = 1 * 1024 ** 3; // 1GB cumulative per IP

// --- Guest usage tracking (mock) ------------------------------------------
//
// Real implementation: server hashes the request IP (hash(ip + IP_HASH_SALT),
// never stored raw — see prisma schema's GuestUploadUsage model) and looks up
///increments a row keyed by that hash. There is no server here yet, so this
// uses localStorage as a stand-in for "cumulative usage from this guest" —
// it's scoped to one browser, not actually one IP, but it exercises the same
// policy (block once cumulative usage crosses the cap) end to end for the
// demo. Swap GUEST_USAGE_STORAGE_KEY reads/writes for a real
// GET/POST /api/upload/eligibility call and nothing above this module needs
// to change, since everything else only depends on the UploadEligibility
// shape, not on how it was computed.
const GUEST_USAGE_STORAGE_KEY = "swimmyfile:guestUploadUsageBytes";

// Non-zero default so the homepage shows a realistic "already used some of
// your guest quota" state on first load, rather than always starting fresh.
const DEFAULT_MOCK_GUEST_USED_BYTES = 100 * 1024 ** 2; // 100MB

function readGuestUsedBytes(): number {
  try {
    const raw = window.localStorage.getItem(GUEST_USAGE_STORAGE_KEY);
    if (raw !== null) return Number(raw) || 0;
  } catch {
    // Storage unavailable (e.g. private browsing) — fall back to the default below.
  }
  return DEFAULT_MOCK_GUEST_USED_BYTES;
}

function writeGuestUsedBytes(bytes: number) {
  try {
    window.localStorage.setItem(GUEST_USAGE_STORAGE_KEY, String(bytes));
  } catch {
    // Storage unavailable — usage just won't persist across reloads.
  }
}

/** Call once a guest upload actually completes, to add to their running total. */
export function recordGuestUpload(fileSizeBytes: number) {
  writeGuestUsedBytes(readGuestUsedBytes() + fileSizeBytes);
}

// --- Pure eligibility logic -------------------------------------------------
// Kept side-effect-free and framework-free so it's trivially unit-testable
// and reusable from a real API route handler later without change.

export function checkGuestUploadLimit(
  guestUsedBytes: number,
  attemptedFileSizeBytes: number,
): { allowed: boolean; remainingBytes: number } {
  const remainingBytes = Math.max(0, GUEST_UPLOAD_LIMIT_BYTES - guestUsedBytes);
  return { allowed: attemptedFileSizeBytes <= remainingBytes, remainingBytes };
}

function buildEligibility(params: {
  isGuest: boolean;
  emailVerified: boolean;
  guestUsedBytes: number;
}): UploadEligibility {
  const { isGuest, emailVerified, guestUsedBytes } = params;
  const guestRemainingBytes = Math.max(0, GUEST_UPLOAD_LIMIT_BYTES - guestUsedBytes);

  if (isGuest) {
    const atLimit = guestRemainingBytes <= 0;
    return {
      canUpload: !atLimit,
      userType: "guest",
      guestLimitBytes: GUEST_UPLOAD_LIMIT_BYTES,
      guestUsedBytes,
      guestRemainingBytes,
      requiresLogin: atLimit,
      reason: atLimit ? "GUEST_LIMIT_REACHED" : null,
    };
  }

  return {
    canUpload: emailVerified,
    userType: "user",
    // Guest fields don't apply once logged in — zeroed rather than omitted
    // so consumers can rely on the shape being fully present either way.
    guestLimitBytes: GUEST_UPLOAD_LIMIT_BYTES,
    guestUsedBytes: 0,
    guestRemainingBytes: 0,
    requiresLogin: false,
    reason: emailVerified ? null : "EMAIL_VERIFICATION_REQUIRED",
  };
}

// --- Hook -------------------------------------------------------------------
// Stands in for `GET /api/upload/eligibility` (see client's suggested
// contract). Returns the same shape a real fetch would resolve to, plus a
// `refresh` for after a guest upload completes (usage changed) and a
// `recordUpload` to report bytes used. `loading` models the network
// round-trip the real version will have.

export function useUploadEligibility() {
  const { status, user } = useSession();
  const [guestUsedBytes, setGuestUsedBytes] = useState(DEFAULT_MOCK_GUEST_USED_BYTES);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setGuestUsedBytes(readGuestUsedBytes());
  }, []);

  useEffect(() => {
    // Deferred rather than reading localStorage during the initial render,
    // matching the pattern already used in lib/session.ts — keeps SSR and
    // first paint consistent (no client/server value mismatch).
    Promise.resolve().then(refresh);
  }, [refresh]);

  useEffect(() => {
    if (status === "loading") return;
    // Tiny artificial delay so the "checking eligibility" state is visible
    // in the UI instead of resolving in the same tick — a real network
    // round-trip wouldn't be instant either.
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, [status]);

  const recordUpload = useCallback((fileSizeBytes: number) => {
    recordGuestUpload(fileSizeBytes);
    setGuestUsedBytes(readGuestUsedBytes());
  }, []);

  const isGuest = status === "guest";
  const emailVerified = user?.emailVerified ?? true;

  const eligibility = buildEligibility({ isGuest, emailVerified, guestUsedBytes });

  return {
    eligibility,
    loading: loading || status === "loading",
    refresh,
    recordUpload,
  };
}

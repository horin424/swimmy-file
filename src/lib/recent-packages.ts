"use client";

import type { SharePackage } from "./types";

const STORAGE_KEY = "swimmyfile:recentPackages";
const MAX_ENTRIES = 10;

// Mock stand-in for "the shared page fetches this package's real files from
// the backend" — since there's no backend yet to persist an upload, the
// browser that just completed one stashes what it actually uploaded here,
// keyed by shareToken. Opening that same link in the same browser then
// shows the real files instead of an unrelated demo package (see
// getPackageByShareToken in mock-data.ts for the fallback everyone else
// still sees). Capped to the last few uploads so this never grows unbounded.

function readStore(): Record<string, SharePackage> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRecentPackage(pkg: SharePackage) {
  try {
    const store = readStore();
    store[pkg.shareToken] = pkg;
    const entries = Object.entries(store);
    const trimmed = entries.length > MAX_ENTRIES ? entries.slice(entries.length - MAX_ENTRIES) : entries;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(trimmed)));
  } catch {
    // Storage unavailable — the upload still completes, it just won't
    // self-preview with real data on this device.
  }
}

export function getRecentPackage(shareToken: string): SharePackage | null {
  try {
    return readStore()[shareToken] ?? null;
  } catch {
    return null;
  }
}

// Mock stand-in for the real backend incrementing package.zipDownloadCount
// once a ZIP download actually starts (see lib/package-zip.ts). Only ever
// affects a package this browser itself uploaded and still has stashed
// locally — a no-op for demo/mock packages, same as the rest of this store.
export function incrementZipDownloadCount(shareToken: string) {
  try {
    const store = readStore();
    const pkg = store[shareToken];
    if (!pkg) return;
    store[shareToken] = { ...pkg, zipDownloadCount: (pkg.zipDownloadCount ?? 0) + 1 };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage unavailable — the download still happened, it just won't be counted.
  }
}

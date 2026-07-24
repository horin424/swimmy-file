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

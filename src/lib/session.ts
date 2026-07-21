"use client";

import { useEffect } from "react";
import { useSyncExternalStore } from "react";

export type SessionStatus = "loading" | "guest" | "authenticated";

export type UserRole = "USER" | "ADMIN";

export interface SessionUser {
  handle: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export interface Session {
  status: SessionStatus;
  user: SessionUser | null;
}

// No auth backend is wired up yet, so this stands in for a real session
// fetch (e.g. a NextAuth/Prisma lookup). The dev-only session switcher
// (bottom-right corner, development builds only) writes to the same store
// so RequireUser/AdminShell/the sidebar can all be previewed in every state
// — guest, unverified, ADMIN — without editing this file.
const DEFAULT_SESSION: Session = {
  status: "authenticated",
  user: {
    handle: "demo_user",
    email: "demo.user@swimmyfile.io",
    role: "USER",
    emailVerified: true,
  },
};

const STORAGE_KEY = "swimmyfile:mockSession";

// A stable reference, not a fresh literal per call — useSyncExternalStore
// requires getServerSnapshot to return a cached value or it warns about
// (and can trigger) an infinite render loop.
const LOADING_SESSION: Session = { status: "loading", user: null };

let currentSession: Session = LOADING_SESSION;
let resolved = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

function loadStoredSession(): Session {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Session;
  } catch {
    // Malformed or unavailable storage — fall back to the default session.
  }
  return DEFAULT_SESSION;
}

export function setMockSession(session: Session) {
  currentSession = session;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage unavailable (e.g. private browsing) — state still updates
    // for this tab via the listener notification below.
  }
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Session {
  return currentSession;
}

function getServerSnapshot(): Session {
  return LOADING_SESSION;
}

export function useSession(): Session {
  // Resolve once on the client, after the initial "loading" render, so SSR
  // and first paint always show the skeleton — never a guest/protected
  // flash — regardless of how many components call useSession().
  useEffect(() => {
    if (resolved) return;
    resolved = true;
    Promise.resolve().then(() => setMockSession(loadStoredSession()));
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

"use client";

import { useEffect, useState } from "react";

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
// fetch (e.g. a NextAuth/Prisma lookup). Swap MOCK_SESSION to preview the
// other states — "guest" | unverified | ADMIN — during development.
const MOCK_SESSION: Session = {
  status: "authenticated",
  user: {
    handle: "demo_user",
    email: "demo.user@swimmyfile.io",
    role: "USER",
    emailVerified: true,
  },
};

function fetchMockSession(): Promise<Session> {
  return Promise.resolve(MOCK_SESSION);
}

export function useSession(): Session {
  const [session, setSession] = useState<Session>({ status: "loading", user: null });

  useEffect(() => {
    let cancelled = false;
    fetchMockSession().then((result) => {
      if (!cancelled) setSession(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return session;
}

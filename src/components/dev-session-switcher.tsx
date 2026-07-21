"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { setMockSession, useSession, type Session } from "@/lib/session";

const presets: { label: string; session: Session; href?: string }[] = [
  { label: "Guest", session: { status: "guest", user: null } },
  {
    label: "User",
    session: {
      status: "authenticated",
      user: { handle: "demo_user", email: "demo.user@swimmyfile.io", role: "USER", emailVerified: true },
    },
  },
  {
    label: "Unverified",
    session: {
      status: "authenticated",
      user: { handle: "new_user", email: "new.user@swimmyfile.io", role: "USER", emailVerified: false },
    },
  },
  {
    label: "Admin",
    session: {
      status: "authenticated",
      user: { handle: "admin_user", email: "admin@swimmyfile.io", role: "ADMIN", emailVerified: true },
    },
    // Switching to Admin is only useful if you land somewhere that shows
    // admin content — the main site sidebar deliberately has no admin nav.
    href: "/admin",
  },
];

// No auth backend exists yet — this lets the mock session (src/lib/session.ts)
// be switched from the running app instead of hand-editing source, so every
// gated view (guest, unverified, ADMIN) stays reachable for preview/QA.
// Intentionally left enabled in production too (not just dev builds) while
// the deployed build is being demoed to the client with no real backend —
// remove/re-gate this once real auth replaces the mock session.
export function DevSessionSwitcher() {
  const [open, setOpen] = useState(false);
  const { status, user } = useSession();
  const router = useRouter();

  const activeLabel =
    status === "guest" ? "Guest" : status === "loading" ? "…" : user?.role === "ADMIN" ? "Admin" : user?.emailVerified === false ? "Unverified" : "User";

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end gap-1.5">
      {open && (
        <div className="flex flex-col gap-1 rounded-lg border border-border bg-popover p-1.5 shadow-lg">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => {
                setMockSession(p.session);
                setOpen(false);
                if (p.href) router.push(p.href);
              }}
              className={cn(
                "rounded-md px-2.5 py-1 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                activeLabel === p.label && "bg-primary/12 text-primary",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-border bg-popover px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground shadow-lg transition-colors hover:text-foreground"
      >
        Dev: {activeLabel}
      </button>
    </div>
  );
}

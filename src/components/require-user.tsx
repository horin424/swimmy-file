"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/session";

// Client-side gate only — this masks the UI while a session resolves and
// redirects guests, but it is not authorization. Once a real backend exists,
// the API routes behind these pages must enforce this independently.
export function RequireUser({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "guest") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status === "loading" || status === "guest") {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  return <>{children}</>;
}

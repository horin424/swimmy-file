"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Users,
  Flag,
  Inbox,
  ShieldBan,
  ArrowLeftToLine,
  Menu,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { AppShell } from "./app-shell";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/videos", label: "Uploads", icon: Film },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/blacklist", label: "Blacklist", icon: ShieldBan },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
];

function AdminNavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                active && "bg-primary/12 text-primary",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/"
        onClick={onNavigate}
        className="mt-auto flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <ArrowLeftToLine className="h-4 w-4" />
        Exit to site
      </Link>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { status, user } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  // Client-side gate only, same caveat as RequireUser: a real backend must
  // enforce admin-only access on its own API routes regardless of this check.
  useEffect(() => {
    if (status === "guest") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status === "loading" || status === "guest") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ocean">
        <div className="h-8 w-8 animate-pulse rounded-full bg-primary/30" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-primary">
            <Compass className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Page not found</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The page you&apos;re looking for doesn&apos;t exist or may have been removed.
            </p>
          </div>
          <Button render={<Link href="/" />} nativeButton={false}>
            Back to home
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-ocean md:flex-row">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            Admin
          </span>
        </div>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" aria-label="Open admin menu" />}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col gap-6 bg-background p-4">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <Logo />
            <AdminNavContent onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col gap-6 border-r border-border px-4 py-5 md:flex">
        <div className="flex items-center justify-between px-1">
          <Logo />
          <span className="rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            Admin
          </span>
        </div>
        <AdminNavContent />
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

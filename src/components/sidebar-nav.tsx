"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Flame,
  History,
  LayoutGrid,
  FolderOpen,
  User,
  LogIn,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Film,
  Flag,
  Users,
  ShieldBan,
  Inbox,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { trendingTags } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const exploreItems: NavItem[] = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/popular", label: "Popular", icon: Flame },
  { href: "/recent", label: "Recent", icon: History },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
];

const guestAccountItems: NavItem[] = [
  { href: "/login", label: "Sign in", icon: LogIn },
  { href: "/signup", label: "Create account", icon: UserPlus },
];

const myAccountItems: NavItem[] = [
  { href: "/me", label: "My Files", icon: FolderOpen },
  { href: "/profile", label: "Profile", icon: User },
];

const adminItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/videos", label: "Videos", icon: Film },
  { href: "/admin/reports", label: "Reports", icon: Flag },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/blacklist", label: "Blacklist", icon: ShieldBan },
  { href: "/admin/inquiries", label: "Support", icon: Inbox },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
];

function initials(handle: string): string {
  const parts = handle.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return handle.slice(0, 2).toUpperCase();
}

function NavSection({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  return (
    <div>
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{title}</p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
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
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <>
      <div className="flex flex-col gap-0.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
      <div className="flex flex-col gap-0.5">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-lg" />
        ))}
      </div>
    </>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const { status, user } = useSession();

  // Never render guest or protected links before the session resolves.
  if (status === "loading") {
    return <SidebarSkeleton />;
  }

  return (
    <>
      <NavSection title="Explore" items={exploreItems} pathname={pathname} />

      {status === "guest" && <NavSection title="Account" items={guestAccountItems} pathname={pathname} />}

      {status === "authenticated" && user && (
        <>
          <NavSection title="My Account" items={myAccountItems} pathname={pathname} />
          {user.role === "ADMIN" && (
            <NavSection title="Administration" items={adminItems} pathname={pathname} />
          )}
        </>
      )}

      <div>
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Trending Tags
        </p>
        <div className="flex flex-wrap gap-1.5 px-3">
          {trendingTags.map((t) => (
            <Link
              key={t.slug}
              href={`/search?q=${encodeURIComponent(t.name.replace("#", ""))}`}
              className="rounded-full border border-border bg-accent px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              {t.name}
            </Link>
          ))}
        </div>
      </div>

      {status === "authenticated" && user && (
        <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex items-center gap-2.5 px-3">
            <Avatar className="h-8 w-8 shrink-0 border border-border">
              <AvatarFallback className="bg-secondary text-xs">{initials(user.handle)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.handle}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          {!user.emailVerified && (
            <p className="px-3 text-xs text-warning">Email verification required</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="mx-1 justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => toast("Signed out")}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      )}
    </>
  );
}

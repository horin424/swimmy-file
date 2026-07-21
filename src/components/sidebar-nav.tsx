"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Compass,
  Search,
  LayoutGrid,
  Upload,
  LayoutDashboard,
  Film,
  History,
  Settings,
  LifeBuoy,
  LogIn,
  UserPlus,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn, initials } from "@/lib/utils";
import { setMockSession, useSession } from "@/lib/session";
import { trendingTags } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // For /me?tab=... destinations, which query value marks this item active —
  // pathname alone can't distinguish Dashboard from My Videos, since they
  // share the same route and only differ by search param.
  tabMatch?: string;
}

// Popular/Recent are filters within Discover (see period/sort controls on
// "/"), not separate routes — the functional spec's route map (SF-UI-001
// §3) has no standalone /popular or /recent page. Categories does have its
// own browse page, so it's kept here unlike those two.
const exploreItemsBase: NavItem[] = [
  { href: "/", label: "Discover", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
];

// Kept out of exploreItemsBase (rather than always shown) so a guest never
// sees an Upload link here that the header already deliberately hides for
// them — this only gets appended for authenticated sessions, below.
const uploadExploreItem: NavItem = { href: "/upload", label: "Upload", icon: Upload };

const guestAccountItems: NavItem[] = [
  { href: "/login", label: "Sign in", icon: LogIn },
  { href: "/signup", label: "Create account", icon: UserPlus },
];

// All four route through the same /me page's tab query param (see
// me/page.tsx), not separate pages — tabMatch is what active-state
// highlighting keys off since the pathname is identical for all of them.
const myAccountItems: NavItem[] = [
  { href: "/me", label: "Dashboard", icon: LayoutDashboard, tabMatch: "dashboard" },
  { href: "/me?tab=videos", label: "My Videos", icon: Film, tabMatch: "videos" },
  { href: "/me?tab=uploads", label: "Upload History", icon: History, tabMatch: "uploads" },
  { href: "/me?tab=settings", label: "Settings", icon: Settings, tabMatch: "settings" },
  // No standalone /contact route in this build — Support already lives at
  // /support (see site-footer/site-header).
  { href: "/support", label: "Support", icon: LifeBuoy },
];

function NavSection({
  title,
  items,
  pathname,
  activeTab,
}: {
  title: string;
  items: NavItem[];
  pathname: string;
  activeTab: string | null;
}) {
  return (
    <div>
      <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">{title}</p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const [itemPath] = item.href.split("?");
          const active =
            item.tabMatch !== undefined
              ? pathname === itemPath && (activeTab ?? "dashboard") === item.tabMatch
              : pathname === item.href;
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
  const activeTab = useSearchParams().get("tab");
  const { status, user } = useSession();

  // Never render guest or protected links before the session resolves.
  if (status === "loading") {
    return <SidebarSkeleton />;
  }

  const exploreItems = status === "authenticated" ? [...exploreItemsBase, uploadExploreItem] : exploreItemsBase;

  return (
    <>
      <NavSection title="Explore" items={exploreItems} pathname={pathname} activeTab={activeTab} />

      {status === "guest" && (
        <NavSection title="Account" items={guestAccountItems} pathname={pathname} activeTab={activeTab} />
      )}

      {status === "authenticated" && user && (
        <NavSection title="My Account" items={myAccountItems} pathname={pathname} activeTab={activeTab} />
      )}

      <div>
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
          Trending Tags
        </p>
        <div className="flex flex-wrap gap-1.5 px-3">
          {trendingTags.slice(0, 6).map((t) => (
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
            onClick={() => {
              setMockSession({ status: "guest", user: null });
              toast("Signed out");
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      )}
    </>
  );
}

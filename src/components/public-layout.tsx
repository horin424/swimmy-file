import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/logo";
import { AccountMenu } from "@/components/account-menu";
import { SiteFooter } from "@/components/site-footer";

// Shared chrome for every page that must NOT feel like the app dashboard —
// homepage, /upload, and the shared file page /d/[shareToken]. No sidebar,
// no search bar, no notifications bell: just logo, Discover, and
// login/avatar. Browsing/account pages (Discover, Search, Categories,
// /me/*, /admin/*) use AppShell (sidebar) instead — see the layout rule in
// the project's design direction notes.
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl md:px-6">
      <Link href="/" className="flex shrink-0">
        <Logo />
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/discover"
          className="hidden items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
        >
          <Compass className="h-4 w-4" />
          Discover
        </Link>
        <AccountMenu />
      </div>
    </header>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ocean">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

import Link from "next/link";
import { Compass } from "lucide-react";
import { Logo } from "@/components/logo";
import { AccountMenu } from "@/components/account-menu";
import { UploadButton } from "@/components/upload-button";
import { SiteFooter } from "@/components/site-footer";

// Shared chrome for every page that must NOT feel like the app dashboard —
// homepage, /upload, and the shared file page /d/[shareToken]. No sidebar,
// no search bar, no notifications bell: just logo, Discover, Upload, and
// login/avatar. Browsing/account pages (Discover, Search, /me/*, /admin/*)
// use AppShell (sidebar) instead — see the layout rule in the project's
// design direction notes.
//
// Upload is included here (not just implied by "you're already on the
// upload page") because this header also renders on /d/[shareToken] —
// someone opening a shared link has no other way back to starting their
// own upload besides the logo.
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
        <UploadButton />
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

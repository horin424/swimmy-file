import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-6 md:px-10">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <Logo className="scale-90 opacity-80" />
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <Link href="/support" className="hover:text-foreground">
            Support
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </nav>
        <p className="text-xs">&copy; 2026 Bavarois LLC</p>
      </div>
    </footer>
  );
}

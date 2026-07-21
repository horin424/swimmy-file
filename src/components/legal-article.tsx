import Link from "next/link";
import { Logo } from "./logo";

// Deliberately not AppShell — Terms/Privacy are public pages reachable
// pre-login (e.g. from the signup form), so they must never expose the
// logged-in app chrome: no search bar, no sidebar, no footer nav links.
// Just a logo header back to Discover and the article itself.
export function LegalArticle({
  title,
  meta,
  banner,
  children,
}: {
  title: string;
  meta: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-ocean">
      <header className="border-b border-border px-4 py-4 md:px-6">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-10 md:px-10">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta}</p>

          {banner}

          <div
            className="mt-8 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground
              [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:first:mt-0
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1
              [&_strong]:text-foreground [&_strong]:font-medium"
          >
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

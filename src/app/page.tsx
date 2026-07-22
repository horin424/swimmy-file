import Link from "next/link";
import { Zap, Link2, Clock3, Compass } from "lucide-react";
import { Logo } from "@/components/logo";
import { AccountMenu } from "@/components/account-menu";
import { HomeUploadHero } from "@/components/home-upload-hero";
import { VideoCard } from "@/components/video-card";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { videos } from "@/lib/mock-data";

const features = [
  {
    icon: Zap,
    title: "Instant upload",
    description: "Drop a file and get a working share link in seconds — no account setup ceremony.",
  },
  {
    icon: Link2,
    title: "One link, shareable anywhere",
    description: "Every upload gets a short, unique link you can drop into a chat, email, or post.",
  },
  {
    icon: Clock3,
    title: "Auto-expiring files",
    description: "Set files to expire after a day, a week, or a month — or keep them up for good.",
  },
];

// Homepage is the upload funnel, so it only needs a taste of what's
// public/trending — the full browse experience lives at /discover.
const popularVideos = [...videos]
  .filter((v) => v.status === "active" && v.visibility === "public")
  .sort((a, b) => b.views - a.views)
  .slice(0, 8);

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-ocean">
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

      <main className="flex-1">
        <section className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center md:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Upload. Share. Discover.
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Send any video with a link, instantly.
          </h1>
          <p className="mt-2 max-w-lg text-sm text-muted-foreground md:text-base">
            Swimmy File is a file-sharing service first — drop a video below and get a link to
            share right away.
          </p>

          <div className="mt-10 w-full">
            <HomeUploadHero />
          </div>
        </section>

        <section className="border-t border-border px-6 py-14 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Popular videos</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  A look at what&apos;s public and trending right now.
                </p>
              </div>
              <Button variant="outline" size="sm" render={<Link href="/discover" />} nativeButton={false}>
                Open Discover
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {popularVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-border px-6 py-14 md:px-10">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-card/40 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

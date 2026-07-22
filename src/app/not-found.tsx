import Link from "next/link";
import { Compass } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
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

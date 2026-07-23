"use client";

import Link from "next/link";
import { Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

// Guests can upload too (up to 1GB cumulative per IP — see
// lib/upload-eligibility.ts), so this shows for guest and authenticated
// sessions alike; only hidden during "loading" so it doesn't flash in
// before the session resolves.
export function UploadButton() {
  const { status } = useSession();
  if (status === "loading") return null;

  return (
    <Button
      render={<Link href="/" />}
      nativeButton={false}
      size="sm"
      className="hidden gap-1.5 bg-gradient-brand text-white hover:opacity-90 sm:flex"
    >
      <UploadIcon className="h-4 w-4" />
      Upload
    </Button>
  );
}

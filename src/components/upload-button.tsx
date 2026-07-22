"use client";

import Link from "next/link";
import { Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

// Uploading requires an account — guests don't get a header CTA for an
// action they can't take; they already have Log in/Sign up in the account
// menu slot instead. Not rendered at all during "loading" either, so the
// button never flashes in for a guest right before session resolves.
export function UploadButton() {
  const { status } = useSession();
  if (status !== "authenticated") return null;

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

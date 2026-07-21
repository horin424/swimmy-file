"use client";

import Link from "next/link";
import { Upload as UploadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

// Uploading requires an account — guests get sent to login (with a `next`
// back to /upload) instead of the upload page itself, mirroring the same
// redirect RequireUser/AdminShell use for direct navigation.
export function UploadButton() {
  const { status } = useSession();
  const href = status === "guest" ? "/login?next=%2Fupload" : "/upload";

  return (
    <Button
      render={<Link href={href} />}
      nativeButton={false}
      size="sm"
      className="hidden gap-1.5 bg-gradient-brand text-white hover:opacity-90 sm:flex"
    >
      <UploadIcon className="h-4 w-4" />
      Upload
    </Button>
  );
}

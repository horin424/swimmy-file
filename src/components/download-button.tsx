"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// No real file storage yet (see AGENTS.md/S3 plan) — stands in for the real
// download until /v/[shareToken] can point at a CloudFront-backed file URL.
export function DownloadButton({ fileName }: { fileName: string }) {
  return (
    <Button
      size="sm"
      className="gap-1.5 bg-gradient-brand text-white hover:opacity-90"
      onClick={() => toast(`Downloading "${fileName}"…`)}
    >
      <Download className="h-3.5 w-3.5" />
      Download
    </Button>
  );
}

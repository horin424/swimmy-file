"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CopyLinkButton({ url, variant = "default" }: { url: string; variant?: "default" | "icon" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e?: React.MouseEvent) => {
    // The icon variant lives inside a VideoCard's Link (thumbnail overlay) —
    // stop it from also triggering navigation to the video.
    e?.preventDefault();
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(`https://${url}`);
    } catch {
      // clipboard API unavailable — still show optimistic feedback in this prototype
    }
    setCopied(true);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopied(false), 1800);
  };

  if (variant === "icon") {
    return (
      <Button
        onClick={handleCopy}
        size="icon-sm"
        variant="outline"
        aria-label="Copy link"
        className="bg-black/55 text-white/90 backdrop-blur-sm hover:bg-black/70 hover:text-white"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    );
  }

  return (
    <Button onClick={handleCopy} size="sm" variant="secondary" className="gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy Link"}
    </Button>
  );
}

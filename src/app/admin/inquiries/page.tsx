"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { inquiries as seedInquiries } from "@/lib/admin-data";
import type { InquiryStatus } from "@/lib/types";
import { toast } from "sonner";

const categoryLabel: Record<string, string> = {
  general: "General",
  copyright: "Copyright",
  report: "Report",
  account: "Account",
};

export default function AdminInquiriesPage() {
  const [statuses, setStatuses] = useState<Record<string, InquiryStatus>>(
    Object.fromEntries(seedInquiries.map((i) => [i.id, i.status])),
  );

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Inquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Messages submitted through the Contact form.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {seedInquiries.map((i) => {
            const status = statuses[i.id];
            const resolved = status === "resolved";
            return (
              <div key={i.id} className="rounded-xl border border-border bg-card/40 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {categoryLabel[i.category]}
                  </Badge>
                  <Badge variant={resolved ? "outline" : "secondary"} className="capitalize">
                    {status}
                  </Badge>
                  <span className="ml-auto text-xs text-muted-foreground">{i.email}</span>
                </div>
                <p className="font-medium">{i.subject}</p>
                <p className="mt-1 text-sm text-muted-foreground">{i.message}</p>
                {i.relatedUrl && (
                  <Link href="#" className="mt-1.5 inline-block text-xs text-primary hover:underline">
                    {i.relatedUrl}
                  </Link>
                )}
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const next: InquiryStatus = resolved ? "open" : "resolved";
                      setStatuses((prev) => ({ ...prev, [i.id]: next }));
                      toast(resolved ? "Marked as open" : "Marked as resolved");
                    }}
                  >
                    {resolved ? (
                      <>
                        <RotateCcw className="h-3.5 w-3.5" /> Reopen
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" /> Mark resolved
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}

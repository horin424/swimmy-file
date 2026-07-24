"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/session";
import { toast } from "sonner";

const reasons = [
  { value: "copyright", label: "Copyright infringement" },
  { value: "spam", label: "Spam" },
  { value: "adult", label: "Adult content" },
  { value: "violence", label: "Violence" },
  { value: "other", label: "Other" },
];

// Report a whole shared upload by default — that's the recipient's actual
// unit of complaint (a bad link), matching the package model everywhere
// else. Optionally narrow to one file inside it when there's more than one
// (see the `files` prop, only passed from the shared package page — a
// Discover card's icon-variant report never has a file list to offer).
const ENTIRE_UPLOAD_VALUE = "__entire_upload__";

export function ReportButton({
  variant = "default",
  files,
}: {
  variant?: "default" | "icon";
  files?: { id: string; displayName: string }[];
}) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);

  const handleTriggerClick = (e: React.MouseEvent) => {
    // The icon variant lives inside a VideoCard's Link (thumbnail overlay) —
    // stop it from also triggering navigation to the shared upload.
    e.preventDefault();
    e.stopPropagation();
    // Reporting requires an account — guests get a notice instead of the
    // report form, same idea as the email-verification gate on uploads
    // (block the action, tell the user why, no dead-end UI).
    if (status !== "authenticated") {
      toast.error("Log in to report this shared upload.");
      return;
    }
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {variant === "icon" ? (
        <Button
          size="icon-sm"
          variant="outline"
          aria-label="Report this shared upload"
          className="bg-black/55 text-white/90 backdrop-blur-sm hover:bg-black/70 hover:text-white"
          onClick={handleTriggerClick}
        >
          <Flag className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="gap-1.5 text-muted-foreground" onClick={handleTriggerClick}>
          <Flag className="h-3.5 w-3.5" />
          Report this shared upload
        </Button>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this shared upload</DialogTitle>
          <DialogDescription>
            Help us keep Swimmy File safe. Reports are reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Reason</Label>
            <Select
              defaultValue="copyright"
              items={Object.fromEntries(reasons.map((r) => [r.value, r.label]))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Nice-to-have per the MVP report model: default target is the
              whole package; narrowing to one file is optional and only
              offered when there's more than one to choose between. */}
          {files && files.length > 1 && (
            <div>
              <Label className="mb-1.5 text-xs text-muted-foreground">Which file is the issue? (optional)</Label>
              <Select
                defaultValue={ENTIRE_UPLOAD_VALUE}
                items={{
                  [ENTIRE_UPLOAD_VALUE]: "Entire shared upload",
                  ...Object.fromEntries(files.map((f) => [f.id, f.displayName])),
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Entire shared upload" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ENTIRE_UPLOAD_VALUE}>Entire shared upload</SelectItem>
                  {files.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Details (optional)</Label>
            <Textarea placeholder="Add any additional context..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="destructive"
            onClick={() => {
              setOpen(false);
              toast.success("Report submitted. Thank you for helping keep Swimmy File safe.");
            }}
          >
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

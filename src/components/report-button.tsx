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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const reasons = [
  { value: "copyright", label: "Copyright infringement" },
  { value: "spam", label: "Spam" },
  { value: "adult", label: "Adult content" },
  { value: "violence", label: "Violence" },
  { value: "other", label: "Other" },
];

export function ReportButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="gap-1.5 text-muted-foreground" />}>
        <Flag className="h-3.5 w-3.5" />
        Report
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report this video</DialogTitle>
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

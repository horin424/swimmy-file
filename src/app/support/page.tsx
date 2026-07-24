"use client";

import { useState } from "react";
import { LifeBuoy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const categories = [
  { value: "general", label: "General inquiry" },
  { value: "copyright", label: "Copyright request" },
  { value: "report", label: "Report abuse" },
  { value: "upload", label: "Upload issue" },
  { value: "account", label: "Account issue" },
];

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto max-w-xl px-6 py-10 md:px-10">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <LifeBuoy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Support</h1>
            <p className="text-sm text-muted-foreground">
              Questions, copyright requests, or reports — we read every message.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-border bg-card/50 p-8 text-center">
            <p className="text-lg font-medium">Thanks — your message is in.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Our team typically responds within 1–2 business days.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setSubmitted(false)}>
              Send another message
            </Button>
          </div>
        ) : (
          <form
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card/50 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
              toast.success("Your message has been submitted");
            }}
          >
            <div>
              <Label className="mb-1.5 text-xs text-muted-foreground">Category</Label>
              <Select
                defaultValue="general"
                items={Object.fromEntries(categories.map((c) => [c.value, c.label]))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email" className="mb-1.5 text-xs text-muted-foreground">
                Email
              </Label>
              <Input id="email" type="email" required placeholder="you@example.com" />
            </div>

            <div>
              <Label htmlFor="subject" className="mb-1.5 text-xs text-muted-foreground">
                Subject
              </Label>
              <Input id="subject" required placeholder="Brief summary of your request" />
            </div>

            <div>
              <Label htmlFor="related-url" className="mb-1.5 text-xs text-muted-foreground">
                Related shared link (optional)
              </Label>
              <Input id="related-url" placeholder="swimmyfile.io/d/..." />
            </div>

            <div>
              <Label htmlFor="message" className="mb-1.5 text-xs text-muted-foreground">
                Message
              </Label>
              <Textarea id="message" required rows={5} placeholder="Tell us what's going on..." />
            </div>

            <Button type="submit" className="mt-1 w-full bg-gradient-brand text-white hover:opacity-90">
              Submit
            </Button>
          </form>
        )}
      </div>
    </AppShell>
  );
}

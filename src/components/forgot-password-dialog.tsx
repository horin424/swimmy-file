"use client";

import { useState } from "react";
import { Mail, MailCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          // Reset after the close animation so the form doesn't visibly
          // flash back to its initial state before the dialog fades out.
          setTimeout(() => {
            setSent(false);
            setEmail("");
          }, 150);
        }
      }}
    >
      <DialogTrigger className="text-xs text-primary hover:underline">Forgot?</DialogTrigger>
      <DialogContent>
        {sent ? (
          <>
            <DialogHeader>
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                <MailCheck className="h-5 w-5" />
              </div>
              <DialogTitle>Check your email</DialogTitle>
              <DialogDescription>
                If an account exists for <strong className="text-foreground">{email}</strong>, a
                password reset link is on its way. It may take a few minutes to arrive.
              </DialogDescription>
            </DialogHeader>
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Reset your password</DialogTitle>
              <DialogDescription>
                Enter the email on your account and we&apos;ll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
                toast.success("Password reset link sent");
              }}
            >
              <div>
                <Label htmlFor="reset-email" className="mb-1.5 text-xs text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="pl-9"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-gradient-brand text-white hover:opacity-90">
                Send reset link
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

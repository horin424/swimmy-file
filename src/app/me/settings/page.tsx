"use client";

import { useState } from "react";
import { BadgeCheck, TriangleAlert, Bell, KeyRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "@/lib/session";
import { toast } from "sonner";

function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const reset = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  const canSubmit = current.length > 0 && next.length >= 8 && next === confirm;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <KeyRound className="h-3.5 w-3.5" />
        Change password
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>Choose a new password with at least 8 characters.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Current password</Label>
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">New password</Label>
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Confirm new password</Label>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            {confirm.length > 0 && confirm !== next && (
              <p className="mt-1 text-xs text-destructive">Passwords don&apos;t match.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={!canSubmit}
            onClick={() => {
              setOpen(false);
              reset();
              toast.success("Password updated");
            }}
          >
            Save new password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [password, setPassword] = useState("");

  const reset = () => {
    setConfirmText("");
    setPassword("");
  };

  const canDelete = confirmText === "DELETE" && password.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>Delete</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete account</DialogTitle>
          <DialogDescription>
            This permanently removes your account and all uploaded files. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">
              Type <span className="font-mono text-foreground">DELETE</span> to confirm
            </Label>
            <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-muted-foreground">Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!canDelete}
            onClick={() => {
              setOpen(false);
              reset();
              toast.error("Account deleted");
            }}
          >
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SettingsPage() {
  const { user } = useSession();
  const [notifications, setNotifications] = useState(true);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8 md:px-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account details and preferences.</p>
      </div>

      <div className="flex max-w-lg flex-col gap-5 rounded-2xl border border-border bg-card/40 p-5">
        <div>
          <Label className="mb-1.5 text-xs text-muted-foreground">Email</Label>
          <Input defaultValue={user.email} disabled />
          <div className="mt-2 flex items-center gap-2">
            {user.emailVerified ? (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <>
                <Badge variant="destructive" className="gap-1">
                  <TriangleAlert className="h-3 w-3" />
                  Not verified
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success(`Verification email sent to ${user.email}`)}
                >
                  Resend verification email
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <span className="text-sm">Account status</span>
          <Badge variant="secondary">Active</Badge>
        </div>

        <div>
          <Label className="mb-1.5 text-xs text-muted-foreground">Password</Label>
          <ChangePasswordDialog />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Email notifications
          </span>
          <Switch checked={notifications} onCheckedChange={(checked) => setNotifications(checked)} />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-destructive">Delete account</p>
            <p className="text-xs text-muted-foreground">Permanently remove your account and files.</p>
          </div>
          <DeleteAccountDialog />
        </div>
      </div>
    </div>
  );
}

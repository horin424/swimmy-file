"use client";

import { useState } from "react";
import { Trash2, ShieldBan } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { blacklist as seedBlacklist } from "@/lib/admin-data";
import type { BlacklistEntry, BlacklistType } from "@/lib/types";
import { toast } from "sonner";

export default function AdminBlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>(seedBlacklist);
  const [type, setType] = useState<BlacklistType>("ip");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");

  const addEntry = () => {
    if (!value.trim()) return;
    const entry: BlacklistEntry = {
      id: `bl_${Date.now()}`,
      type,
      value: value.trim(),
      reason: reason.trim() || "No reason provided",
      createdAt: new Date().toISOString(),
    };
    setEntries((prev) => [entry, ...prev]);
    setValue("");
    setReason("");
    toast.success("Added to blacklist");
  };

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Blacklist</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Block abusive IPs, emails, or users from the platform.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card/40 p-4 sm:flex-row sm:items-end">
          <div className="w-full sm:w-36">
            <Label className="mb-1.5 text-xs text-muted-foreground">Type</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as BlacklistType)}
              items={{ ip: "IP address", email: "Email", user: "User" }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ip">IP address</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full flex-1">
            <Label className="mb-1.5 text-xs text-muted-foreground">Value</Label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 203.0.113.42" />
          </div>
          <div className="w-full flex-1">
            <Label className="mb-1.5 text-xs text-muted-foreground">Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for blocking" />
          </div>
          <Button
            onClick={addEntry}
            disabled={!value.trim()}
            className="gap-1.5 bg-gradient-brand text-white hover:opacity-90 sm:w-auto"
          >
            <ShieldBan className="h-4 w-4" />
            Add
          </Button>
        </div>

        {/* Mobile: stacked cards */}
        <div className="flex flex-col gap-2 md:hidden">
          {entries.map((e) => (
            <div key={e.id} className="rounded-xl border border-border bg-card/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Badge variant="outline" className="mb-1 uppercase">
                    {e.type}
                  </Badge>
                  <p className="truncate font-medium">{e.value}</p>
                  <p className="text-xs text-muted-foreground">{e.reason}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${e.value} from blacklist`}
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => {
                    setEntries((prev) => prev.filter((x) => x.id !== e.id));
                    toast(`Removed ${e.value} from blacklist`);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: table */}
        <div className="hidden rounded-2xl border border-border bg-card/40 md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {e.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{e.value}</TableCell>
                  <TableCell className="text-muted-foreground">{e.reason}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ${e.value} from blacklist`}
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setEntries((prev) => prev.filter((x) => x.id !== e.id));
                        toast(`Removed ${e.value} from blacklist`);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}

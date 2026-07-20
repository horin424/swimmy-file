"use client";

import { useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminUsers } from "@/lib/admin-data";
import type { UserStatus } from "@/lib/types";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [statuses, setStatuses] = useState<Record<string, UserStatus>>(
    Object.fromEntries(adminUsers.map((u) => [u.id, u.status])),
  );

  const banAction = (id: string, handle: string, banned: boolean) => (
    <Button
      variant="outline"
      size="sm"
      className={banned ? "" : "text-destructive hover:text-destructive"}
      onClick={() => {
        const next: UserStatus = banned ? "active" : "banned";
        setStatuses((prev) => ({ ...prev, [id]: next }));
        toast(banned ? `@${handle} unbanned` : `@${handle} banned`);
      }}
    >
      {banned ? (
        <>
          <ShieldCheck className="h-3.5 w-3.5" /> Unban
        </>
      ) : (
        <>
          <ShieldOff className="h-3.5 w-3.5" /> Ban
        </>
      )}
    </Button>
  );

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage accounts, trust levels, and bans.
          </p>
        </div>

        {/* Mobile: stacked cards */}
        <div className="flex flex-col gap-2 md:hidden">
          {adminUsers.map((u) => {
            const status = statuses[u.id];
            const banned = status === "banned";
            return (
              <div key={u.id} className="rounded-xl border border-border bg-card/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">@{u.handle}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="shrink-0">{banAction(u.id, u.handle, banned)}</div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="capitalize">{u.trustLevel}</span>
                  <span>{u.uploads} uploads</span>
                  {u.reportCount > 0 && (
                    <Badge variant="destructive">
                      {u.reportCount} {u.reportCount === 1 ? "report" : "reports"}
                    </Badge>
                  )}
                  <Badge variant={banned ? "destructive" : "secondary"} className="capitalize">
                    {status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden rounded-2xl border border-border bg-card/40 md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Trust level</TableHead>
                <TableHead>Uploads</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((u) => {
                const status = statuses[u.id];
                const banned = status === "banned";
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">@{u.handle}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">{u.trustLevel}</TableCell>
                    <TableCell className="text-muted-foreground">{u.uploads}</TableCell>
                    <TableCell>
                      {u.reportCount > 0 ? (
                        <Badge variant="destructive">{u.reportCount}</Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={banned ? "destructive" : "secondary"} className="capitalize">
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{banAction(u.id, u.handle, banned)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}

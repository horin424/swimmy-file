import { AppShell } from "@/components/app-shell";
import { RequireUser } from "@/components/require-user";

// Shared shell for every /me/* account page (Dashboard, My Videos, Upload
// History, Settings) — auth gating and the app chrome live here once
// instead of being repeated in each page.
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <RequireUser>{children}</RequireUser>
    </AppShell>
  );
}

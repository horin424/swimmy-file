import { SiteHeader } from "./site-header";
import { SiteSidebar } from "./site-sidebar";
import { SiteFooter } from "./site-footer";
import { MobileTabBar } from "./mobile-tab-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ocean">
      <SiteHeader />
      <div className="flex flex-1">
        <SiteSidebar />
        <main className="flex flex-1 flex-col overflow-x-hidden pb-16 md:pb-0">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </main>
      </div>
      <MobileTabBar />
    </div>
  );
}

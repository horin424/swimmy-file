import { Suspense } from "react";
import { SidebarNav, SidebarSkeleton } from "./sidebar-nav";

export function SiteSidebar() {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col gap-6 overflow-y-auto border-r border-border px-4 py-5 md:flex">
      <Suspense fallback={<SidebarSkeleton />}>
        <SidebarNav />
      </Suspense>
    </aside>
  );
}

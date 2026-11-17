import type { ReactNode } from "react";
import { BottomNav, DesktopSidebar } from "@/components/app/BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen pb-24 lg:pl-64 lg:pb-0">
      <DesktopSidebar />
      {children}
      <BottomNav />
    </div>
  );
}

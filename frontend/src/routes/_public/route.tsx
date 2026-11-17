import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/_public")({
  ssr: false,
  component: PublicLayout,
});

function PublicLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

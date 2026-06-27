import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Users, MessagesSquare, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/feed", label: "Home", icon: Home },
  { to: "/groups", label: "Groups", icon: Users },
  { to: "/chats", label: "Chats", icon: MessagesSquare },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 px-4 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md mb-3 glass-strong rounded-full px-2 py-2 flex items-center justify-between relative">
        {TABS.slice(0, 2).map((t) => (
          <TabLink key={t.to} {...t} active={pathname.startsWith(t.to)} />
        ))}

        <Link
          to="/post"
          className="-mt-8 mx-2 size-14 rounded-full gradient-primary-bg ring-glow flex items-center justify-center text-primary-foreground shadow-lg shrink-0"
          aria-label="New confession"
        >
          <Plus className="size-6" strokeWidth={2.5} />
        </Link>

        {TABS.slice(2).map((t) => (
          <TabLink key={t.to} {...t} active={pathname.startsWith(t.to)} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({
  to, label, icon: Icon, active,
}: { to: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[11px] transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon className={cn("size-5", active && "drop-shadow-[0_0_8px_oklch(0.72_0.18_295/0.7)]")} />
      <span>{label}</span>
    </Link>
  );
}

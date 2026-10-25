import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Users, MessagesSquare, User, Plus, Feather } from "lucide-react";
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
    <nav className="fixed bottom-0 inset-x-0 z-40 px-4 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto max-w-md mb-3 rounded-full border border-glass-border bg-background/70 px-2 py-2 shadow-[var(--shadow-glass)] backdrop-blur-xl flex items-center justify-between relative">
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

export function DesktopSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/80 bg-background/90 px-5 py-7 backdrop-blur-xl lg:flex">
      <Link to="/feed" className="mb-10 flex items-center gap-3 px-2">
        <span className="flex size-10 items-center justify-center rounded-xl gradient-primary-bg text-primary-foreground">
          <Feather className="size-5" />
        </span>
        <span>
          <span className="block font-display text-xl font-bold gradient-text">Whisper</span>
          <span className="block text-xs text-muted-foreground">Say it without a name</span>
        </span>
      </Link>

      <nav aria-label="Main navigation" className="space-y-1">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/12 text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      <Link
        to="/post"
        className="mt-7 flex items-center justify-center gap-2 rounded-xl gradient-primary-bg px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg"
      >
        <Plus className="size-4" />
        New confession
      </Link>

      <p className="mt-auto px-2 text-xs leading-relaxed text-muted-foreground">
        A quieter corner of the internet. Share honestly, respond kindly.
      </p>
    </aside>
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

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Trash2, Bell, BellOff, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Username } from "@/components/app/Username";
import { useCurrentUserId, useMyProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Whisper" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const me = useCurrentUserId();
  const navigate = useNavigate();
  const profileQ = useMyProfile();
  const p = profileQ.data;

  const statsQ = useQuery({
    queryKey: ["profile-stats", me],
    enabled: !!me,
    queryFn: async () => {
      const [posts, groups, chats] = await Promise.all([
        supabase.from("confessions").select("id", { count: "exact", head: true }).eq("author_id", me!),
        supabase.from("group_members").select("group_id", { count: "exact", head: true }).eq("user_id", me!),
        supabase.from("chat_participants").select("thread_id", { count: "exact", head: true }).eq("user_id", me!),
      ]);
      return { posts: posts.count ?? 0, groups: groups.count ?? 0, chats: chats.count ?? 0 };
    },
  });

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  async function deleteAccount() {
    if (!confirm("Delete your account permanently? This can't be undone.")) return;
    // Hard-delete: best we can client-side is sign out + delete profile row (cascades).
    if (me) await supabase.from("profiles").delete().eq("id", me);
    await supabase.auth.signOut();
    toast.success("Account deleted.");
    navigate({ to: "/auth", replace: true });
  }

  async function toggleNotifications() {
    if (!me || !p) return;
    const next = !p.notifications_enabled;
    const { error } = await supabase.from("profiles").update({ notifications_enabled: next }).eq("id", me);
    if (error) toast.error(error.message); else { profileQ.refetch(); toast.success(next ? "On" : "Off"); }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 lg:pt-10">
      <header className="text-center mb-6">
        <div className="size-20 rounded-full gradient-primary-bg ring-glow flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto">
          {(p?.anon_number ?? "?").toString().slice(-2)}
        </div>
        <h1 className="mt-3 text-xl font-bold"><Username anonNumber={p?.anon_number} isGuest={p?.is_guest} className="text-xl" /></h1>
        <p className="text-xs text-muted-foreground mt-1">
          <Shield className="size-3 inline mr-1" />
          {p?.is_guest ? "Guest account · device-only" : "Registered account"}
        </p>
        {p?.created_at && <p className="text-[11px] text-muted-foreground mt-1">Joined {format(new Date(p.created_at), "MMM yyyy")}</p>}
      </header>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <Stat label="Posts" value={statsQ.data?.posts ?? 0} />
        <Stat label="Groups" value={statsQ.data?.groups ?? 0} />
        <Stat label="Chats" value={statsQ.data?.chats ?? 0} />
      </div>

      <section className="space-y-2">
        <button onClick={toggleNotifications}
          className="w-full glass rounded-2xl p-4 flex items-center justify-between text-sm">
          <span className="flex items-center gap-3">
            {p?.notifications_enabled ? <Bell className="size-4" /> : <BellOff className="size-4" />}
            Notifications
          </span>
          <span className="text-muted-foreground">{p?.notifications_enabled ? "On" : "Off"}</span>
        </button>
        <button onClick={logout} className="w-full glass rounded-2xl p-4 flex items-center gap-3 text-sm">
          <LogOut className="size-4" /> Log out
        </button>
        <button onClick={deleteAccount} className="w-full glass rounded-2xl p-4 flex items-center gap-3 text-sm text-destructive">
          <Trash2 className="size-4" /> Delete account
        </button>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4 text-center">
      <div className="text-xl font-bold gradient-text">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

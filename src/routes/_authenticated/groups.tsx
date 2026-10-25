import { useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Lock, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserId } from "@/hooks/useProfile";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/groups")({
  head: () => ({ meta: [{ title: "Groups — Whisper" }] }),
  component: GroupsPage,
});

function GroupsPage() {
  const isGroupsList = useRouterState({
    select: (state) => state.location.pathname.replace(/\/+$/, "") === "/groups",
  });

  return isGroupsList ? <GroupsList /> : <Outlet />;
}

function GroupsList() {
  const me = useCurrentUserId();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  const groupsQ = useQuery({
    queryKey: ["groups-list", me],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select("id, name, slug, description, category, is_private, icon_url, creator_id")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const myMembershipQ = useQuery({
    queryKey: ["my-memberships", me],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members").select("group_id").eq("user_id", me!);
      if (error) throw error;
      return new Set(data.map((r) => r.group_id));
    },
  });

  const joinByCode = useMutation({
    mutationFn: async (code: string) => {
      if (!me) throw new Error("Sign in");
      const { data: g, error } = await supabase
        .from("groups").select("id").eq("invite_code", code.trim()).maybeSingle();
      if (error) throw error;
      if (!g) throw new Error("Invalid invite code");
      const { error: mErr } = await supabase
        .from("group_members").insert({ group_id: g.id, user_id: me });
      if (mErr && !mErr.message.includes("duplicate")) throw mErr;
      return g.id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
      qc.invalidateQueries({ queryKey: ["groups-list"] });
      toast.success("Joined.");
      setJoinCode("");
      window.location.href = `/groups/${id}`;
    },
    onError: (e: any) => toast.error(e.message),
  });

  const joinPublic = useMutation({
    mutationFn: async (groupId: string) => {
      if (!me) return;
      const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: me });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-memberships"] });
      toast.success("Joined.");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 lg:pt-10">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold gradient-text">Groups</h1>
        <button onClick={() => setCreating(true)} className="size-10 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground">
          <Plus className="size-4" />
        </button>
      </header>

      <div className="glass rounded-2xl p-3 flex gap-2 mb-4">
        <KeyRound className="size-4 self-center text-muted-foreground" />
        <input value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter invite code"
          className="flex-1 bg-transparent outline-none text-sm" />
        <button disabled={!joinCode.trim()} onClick={() => joinByCode.mutate(joinCode)}
          className="text-xs px-3 py-1.5 rounded-full gradient-primary-bg text-primary-foreground disabled:opacity-50">Join</button>
      </div>

      <div className="space-y-3 pb-6">
        {groupsQ.isLoading && <div className="glass rounded-3xl h-32 animate-pulse" />}
        {groupsQ.data?.length === 0 && (
          <div className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
            No groups yet. Create the first one.
          </div>
        )}
        {groupsQ.data?.map((g, i) => {
          const joined = myMembershipQ.data?.has(g.id);
          return (
            <div key={g.id} style={{ animationDelay: `${i * 0.03}s` }}
              className="glass animate-float-up rounded-3xl p-4 flex items-center gap-3">
              <div className="size-12 rounded-2xl gradient-primary-bg flex items-center justify-center text-primary-foreground font-bold">
                {g.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold truncate">{g.name}</h3>
                  {g.is_private && <Lock className="size-3 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{g.category ?? "Community"}{g.description ? ` · ${g.description}` : ""}</p>
              </div>
              {joined ? (
                <Link to="/groups/$groupId" params={{ groupId: g.id }}
                  className="text-xs px-3 py-1.5 rounded-full glass">Open</Link>
              ) : g.is_private ? (
                <span className="text-xs px-3 py-1.5 rounded-full glass text-muted-foreground">Private</span>
              ) : (
                <button onClick={() => joinPublic.mutate(g.id)} className="text-xs px-3 py-1.5 rounded-full gradient-primary-bg text-primary-foreground font-semibold">Join</button>
              )}
            </div>
          );
        })}
      </div>

      {creating && <CreateGroupModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); qc.invalidateQueries({ queryKey: ["groups-list"] }); }} />}
    </main>
  );
}

function CreateGroupModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const me = useCurrentUserId();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!me || !name.trim()) return;
    setLoading(true);
    try {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "-" + Math.random().toString(36).slice(2, 6);
      const inviteCode = isPrivate ? Math.random().toString(36).slice(2, 10).toUpperCase() : null;
      const { data, error } = await supabase.from("groups").insert({
        name: name.trim(), slug, description: description.trim() || null, category: category.trim() || null,
        is_private: isPrivate, invite_code: inviteCode, creator_id: me,
      }).select("id").single();
      if (error) throw error;
      await supabase.from("group_members").insert({ group_id: data.id, user_id: me, role: "admin" });
      toast.success(inviteCode ? `Group created. Invite code: ${inviteCode}` : "Group created.");
      onCreated();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="glass-strong animate-float-up rounded-3xl p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Users className="size-4" /> Create group</h2>
        <div className="space-y-3">
          <input placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-2xl bg-input/60 px-4 py-3 outline-none border border-border focus:border-primary" />
          <input placeholder="Category (e.g. Developers)" value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl bg-input/60 px-4 py-3 outline-none border border-border focus:border-primary" />
          <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full rounded-2xl bg-input/60 px-4 py-3 outline-none border border-border focus:border-primary resize-none" />
          <label className="flex items-center justify-between glass rounded-2xl p-3 text-sm">
            <span className="flex items-center gap-2"><Lock className="size-4" /> Private (invite-only)</span>
            <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          </label>
        </div>
        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-2xl glass py-3 text-sm">Cancel</button>
          <button onClick={create} disabled={loading || !name.trim()} className="flex-1 rounded-2xl gradient-primary-bg py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {loading ? "Creating…" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

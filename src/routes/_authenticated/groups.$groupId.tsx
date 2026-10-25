import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Send, Hash, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConfessionCard, type ConfessionRow } from "@/components/app/ConfessionCard";
import {
  EMPTY_CONFESSION_INTERACTIONS,
  useConfessionInteractions,
  useCurrentUserId,
  useProfilesByIds,
} from "@/hooks/useProfile";
import { Username } from "@/components/app/Username";
import { CATEGORIES, type Category } from "@/lib/categories";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/groups/$groupId")({
  head: () => ({ meta: [{ title: "Group — Whisper" }] }),
  component: GroupPage,
});

function GroupPage() {
  const { groupId } = Route.useParams();
  const me = useCurrentUserId();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"feed" | "chat" | "members">("feed");

  const groupQ = useQuery({
    queryKey: ["group", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups").select("*").eq("id", groupId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const membersQ = useQuery({
    queryKey: ["group-members", groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_members").select("user_id, role").eq("group_id", groupId);
      if (error) throw error;
      return data;
    },
  });

  const isMember = !!membersQ.data?.some((m) => m.user_id === me);

  const postsQ = useQuery({
    queryKey: ["group-confessions", groupId],
    enabled: isMember,
    queryFn: async (): Promise<ConfessionRow[]> => {
      const { data, error } = await supabase
        .from("confessions").select("*").eq("group_id", groupId)
        .order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data as ConfessionRow[];
    },
  });
  const interactionsQ = useConfessionInteractions(postsQ.data ?? [], me);
  const interactions = interactionsQ.data ?? EMPTY_CONFESSION_INTERACTIONS;

  // group chat thread (auto-create if missing & member)
  const threadQ = useQuery({
    queryKey: ["group-thread", groupId],
    enabled: isMember,
    queryFn: async () => {
      const { data } = await supabase.from("chat_threads").select("id")
        .eq("kind", "group").eq("group_id", groupId).maybeSingle();
      if (data) return data.id;
      const { data: t, error } = await supabase.from("chat_threads")
        .insert({ kind: "group", group_id: groupId }).select("id").single();
      if (error) throw error;
      return t.id;
    },
  });

  async function joinGroup() {
    if (!me) return;
    const { error } = await supabase.from("group_members").insert({ group_id: groupId, user_id: me });
    if (error) toast.error(error.message);
    else { qc.invalidateQueries({ queryKey: ["group-members", groupId] }); toast.success("Joined."); }
  }

  async function leaveGroup() {
    if (!me) return;
    const { error } = await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", me);
    if (error) toast.error(error.message);
    else navigate({ to: "/groups" });
  }

  if (!groupQ.data) return <main className="px-4 pt-6"><div className="glass rounded-3xl h-40 animate-pulse" /></main>;

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 lg:pt-10">
      <header className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate({ to: "/groups" })} className="size-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate flex items-center gap-2">
            <Hash className="size-4 text-muted-foreground" />{groupQ.data.name}
          </h1>
          <p className="text-xs text-muted-foreground truncate">
            {membersQ.data?.length ?? 0} members · {groupQ.data.category ?? "Community"}
          </p>
        </div>
        {isMember ? (
          <button onClick={leaveGroup} className="text-xs px-3 py-1.5 rounded-full glass">Leave</button>
        ) : (
          <button onClick={joinGroup} className="text-xs px-3 py-1.5 rounded-full gradient-primary-bg text-primary-foreground font-semibold">Join</button>
        )}
      </header>

      {groupQ.data.invite_code && isMember && (
        <div className="glass rounded-2xl p-3 mb-3 text-xs flex justify-between items-center">
          <span className="text-muted-foreground">Invite code</span>
          <button onClick={() => { navigator.clipboard.writeText(groupQ.data!.invite_code!); toast.success("Copied"); }}
            className="font-mono tracking-wider">{groupQ.data.invite_code}</button>
        </div>
      )}

      <div className="glass rounded-full p-1 flex text-sm mb-4">
        {(["feed", "chat", "members"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full capitalize transition ${
              tab === t ? "gradient-primary-bg text-primary-foreground font-semibold" : "text-muted-foreground"
            }`}>{t}</button>
        ))}
      </div>

      {!isMember && tab !== "members" && (
        <div className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">
          Join this group to see posts and chat.
        </div>
      )}

      {isMember && tab === "feed" && (
        <div className="space-y-3 pb-6">
          <GroupComposer groupId={groupId} onPosted={() => qc.invalidateQueries({ queryKey: ["group-confessions", groupId] })} />
          {postsQ.data?.length === 0 && (
            <div className="glass rounded-3xl p-6 text-center text-sm text-muted-foreground">Be the first to post.</div>
          )}
          {postsQ.data?.map((c, i) => (
            <ConfessionCard key={c.id} confession={c} index={i} interactions={interactions} />
          ))}
        </div>
      )}

      {isMember && tab === "chat" && threadQ.data && (
        <GroupChat threadId={threadQ.data} />
      )}

      {tab === "members" && <MembersList memberIds={(membersQ.data ?? []).map((m) => m.user_id)} />}
    </main>
  );
}

function GroupComposer({ groupId, onPosted }: { groupId: string; onPosted: () => void }) {
  const me = useCurrentUserId();
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>("Random");

  async function post() {
    if (!me || body.trim().length < 3) return;
    const { error } = await supabase.from("confessions").insert({
      author_id: me, group_id: groupId, body: body.trim(), category, mood: null,
    });
    if (error) toast.error(error.message);
    else { setBody(""); onPosted(); }
  }

  return (
    <div className="glass rounded-3xl p-4">
      <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={2000}
        placeholder="Share with the group, anonymously…"
        className="w-full bg-transparent outline-none resize-none placeholder:text-muted-foreground text-sm" />
      <div className="mt-2 flex items-center justify-between gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value as Category)}
          className="text-xs glass rounded-full px-3 py-1.5 bg-card border-border">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={post} disabled={body.trim().length < 3}
          className="text-sm px-4 py-2 rounded-full gradient-primary-bg text-primary-foreground font-semibold disabled:opacity-50">Post</button>
      </div>
    </div>
  );
}

function MembersList({ memberIds }: { memberIds: string[] }) {
  const profs = useProfilesByIds(memberIds);
  return (
    <div className="space-y-2 pb-6">
      {memberIds.map((id) => {
        const p = profs.data?.get(id);
        return (
          <div key={id} className="glass rounded-2xl p-3 flex items-center gap-3">
            <div className="size-9 rounded-full gradient-primary-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
              {(p?.anon_number ?? "?").toString().slice(-2)}
            </div>
            <Username anonNumber={p?.anon_number} isGuest={p?.is_guest} className="text-sm" />
          </div>
        );
      })}
    </div>
  );
}

function GroupChat({ threadId }: { threadId: string }) {
  const me = useCurrentUserId();
  const qc = useQueryClient();
  const [text, setText] = useState("");

  const msgsQ = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages").select("id, sender_id, body, created_at")
        .eq("thread_id", threadId).order("created_at", { ascending: true }).limit(200);
      if (error) throw error;
      return data;
    },
  });

  const senderIds = (msgsQ.data ?? []).map((m) => m.sender_id);
  const profs = useProfilesByIds(senderIds);

  useEffect(() => {
    const ch = supabase.channel(`thread-${threadId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `thread_id=eq.${threadId}` },
        () => qc.invalidateQueries({ queryKey: ["messages", threadId] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [threadId, qc]);

  async function send() {
    if (!me || !text.trim()) return;
    const v = text.trim(); setText("");
    const { error } = await supabase.from("messages").insert({ thread_id: threadId, sender_id: me, body: v });
    if (error) { setText(v); toast.error(error.message); }
  }

  return (
    <div className="glass-strong rounded-3xl p-3 flex flex-col h-[60vh]">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {msgsQ.data?.map((m) => {
          const mine = m.sender_id === me;
          const p = profs.data?.get(m.sender_id);
          return (
            <div key={m.id} className={`animate-float-up flex flex-col ${mine ? "items-end" : "items-start"}`}>
              {!mine && <Username anonNumber={p?.anon_number} className="text-[10px] mb-0.5" />}
              <div className={`rounded-2xl px-3 py-2 text-sm max-w-[80%] ${mine ? "gradient-primary-bg text-primary-foreground" : "glass"}`}>
                {m.body}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2 items-end">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={1}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Message the group…"
          className="flex-1 bg-input/60 rounded-2xl px-3 py-2 outline-none border border-border resize-none text-sm" />
        <button onClick={send} disabled={!text.trim()}
          className="size-10 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground disabled:opacity-50">
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}

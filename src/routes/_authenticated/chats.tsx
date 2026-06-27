import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessagesSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Username } from "@/components/app/Username";
import { useCurrentUserId, useProfilesByIds } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/chats")({
  head: () => ({ meta: [{ title: "Chats — Whisper" }] }),
  component: ChatsPage,
});

function ChatsPage() {
  const me = useCurrentUserId();

  const threadsQ = useQuery({
    queryKey: ["chat-threads", me],
    enabled: !!me,
    queryFn: async () => {
      const { data: parts, error } = await supabase
        .from("chat_participants")
        .select("thread_id, last_read_at, chat_threads!inner(id, kind, group_id, created_at, groups(name))")
        .eq("user_id", me!);
      if (error) throw error;

      const threadIds = parts.map((p: any) => p.thread_id);
      if (threadIds.length === 0) return [];

      // Last message + counterparts for direct threads
      const { data: lastMsgs } = await supabase
        .from("messages").select("thread_id, body, created_at, sender_id")
        .in("thread_id", threadIds).order("created_at", { ascending: false });
      const lastByThread = new Map<string, any>();
      (lastMsgs ?? []).forEach((m: any) => { if (!lastByThread.has(m.thread_id)) lastByThread.set(m.thread_id, m); });

      const { data: others } = await supabase
        .from("chat_participants").select("thread_id, user_id").in("thread_id", threadIds);
      const counterpart = new Map<string, string>();
      (others ?? []).forEach((p: any) => { if (p.user_id !== me) counterpart.set(p.thread_id, p.user_id); });

      return parts.map((p: any) => ({
        threadId: p.thread_id,
        kind: p.chat_threads.kind,
        groupName: p.chat_threads.groups?.name as string | undefined,
        last: lastByThread.get(p.thread_id),
        otherId: counterpart.get(p.thread_id),
        lastRead: p.last_read_at,
      })).sort((a, b) => (b.last?.created_at ?? "").localeCompare(a.last?.created_at ?? ""));
    },
  });

  const otherIds = (threadsQ.data ?? []).map((t) => t.otherId).filter(Boolean) as string[];
  const profs = useProfilesByIds(otherIds);

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <h1 className="text-2xl font-bold gradient-text mb-4">Chats</h1>
      <div className="space-y-2 pb-6">
        {threadsQ.isLoading && <div className="glass rounded-3xl h-20 animate-pulse" />}
        {threadsQ.data?.length === 0 && (
          <div className="glass rounded-3xl p-8 text-center text-sm text-muted-foreground">
            <MessagesSquare className="size-6 mx-auto mb-2 opacity-60" />
            No chats yet. Reply privately to someone's confession to start a conversation.
          </div>
        )}
        {threadsQ.data?.map((t) => {
          const p = t.otherId ? profs.data?.get(t.otherId) : null;
          const unread = t.last && t.last.sender_id !== me && t.lastRead && new Date(t.last.created_at) > new Date(t.lastRead);
          return (
            <Link key={t.threadId} to="/chats/$threadId" params={{ threadId: t.threadId }}
              className="glass rounded-2xl p-3 flex items-center gap-3">
              <div className="size-11 rounded-full gradient-primary-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                {t.kind === "group" ? "#" : (p?.anon_number ?? "?").toString().slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <div className="text-sm font-semibold truncate">
                    {t.kind === "group" ? t.groupName ?? "Group" : <Username anonNumber={p?.anon_number} />}
                  </div>
                  {t.last && <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                    {formatDistanceToNow(new Date(t.last.created_at), { addSuffix: false })}
                  </span>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{t.last?.body ?? "No messages yet"}</p>
              </div>
              {unread && <div className="size-2 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </main>
  );
}

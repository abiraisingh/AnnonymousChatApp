import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MessagesSquare } from "lucide-react";
import { database } from "@/integrations/database/client";
import { Username } from "@/components/app/Username";
import { useCurrentUserId, useProfilesByIds } from "@/hooks/useProfile";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/chats")({
  head: () => ({ meta: [{ title: "Chats — Whisper" }] }),
  component: ChatsPage,
});

function ChatsPage() {
  const isChatList = useRouterState({
    select: (state) => state.location.pathname.replace(/\/+$/, "") === "/chats",
  });

  return isChatList ? <ChatsList /> : <Outlet />;
}

function ChatsList() {
  const me = useCurrentUserId();

  const threadsQ = useQuery({
    queryKey: ["chat-threads", me],
    enabled: !!me,
    queryFn: async () => {
      const { data: parts, error } = await database
        .from("chat_participants")
        .select("thread_id, last_read_at")
        .eq("user_id", me!);
      if (error) throw error;

      const threadIds = parts.map((p) => p.thread_id);
      if (threadIds.length === 0) return [];
      const { data: threadRows, error: threadError } = await database
        .from("chat_threads")
        .select("id, kind, group_id, created_at")
        .in("id", threadIds);
      if (threadError) throw threadError;
      const threadsById = new Map((threadRows ?? []).map((thread) => [thread.id, thread]));
      const groupIds = (threadRows ?? [])
        .map((thread) => thread.group_id)
        .filter((id): id is string => id !== null);
      const { data: groupRows, error: groupsError } = groupIds.length
        ? await database.from("groups").select("id, name").in("id", groupIds)
        : { data: [], error: null };
      if (groupsError) throw groupsError;
      const groupsById = new Map((groupRows ?? []).map((group) => [group.id, group]));

      // Last message + counterparts for direct threads
      const { data: lastMsgs, error: messagesError } = await database
        .from("messages")
        .select("thread_id, body, created_at, sender_id")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: false });
      if (messagesError) throw messagesError;
      const lastByThread = new Map<
        string,
        { thread_id: string; body: string; created_at: string; sender_id: string }
      >();
      (lastMsgs ?? []).forEach((m) => {
        if (!lastByThread.has(m.thread_id)) lastByThread.set(m.thread_id, m);
      });

      const { data: others, error: participantsError } = await database
        .from("chat_participants")
        .select("thread_id, user_id")
        .in("thread_id", threadIds);
      if (participantsError) throw participantsError;
      const counterpart = new Map<string, string>();
      (others ?? []).forEach((p) => {
        if (p.user_id !== me) counterpart.set(p.thread_id, p.user_id);
      });

      return parts
        .map((p) => {
          const thread = threadsById.get(p.thread_id);
          return {
            threadId: p.thread_id,
            kind: thread?.kind,
            groupName: thread?.group_id ? groupsById.get(thread.group_id)?.name : undefined,
            last: lastByThread.get(p.thread_id),
            otherId: counterpart.get(p.thread_id),
            lastRead: p.last_read_at,
          };
        })
        .sort((a, b) => (b.last?.created_at ?? "").localeCompare(a.last?.created_at ?? ""));
    },
    refetchInterval: 10_000,
  });

  const otherIds = (threadsQ.data ?? []).map((t) => t.otherId).filter(Boolean) as string[];
  const profs = useProfilesByIds(otherIds);

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 lg:pt-10">
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
          const unread =
            t.last &&
            t.last.sender_id !== me &&
            t.lastRead &&
            new Date(t.last.created_at) > new Date(t.lastRead);
          return (
            <Link
              key={t.threadId}
              to="/chats/$threadId"
              params={{ threadId: t.threadId }}
              className="glass rounded-2xl p-3 flex items-center gap-3"
            >
              <div className="size-11 rounded-full gradient-primary-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
                {t.kind === "group" ? "#" : (p?.anon_number ?? "?").toString().slice(-2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <div className="text-sm font-semibold truncate">
                    {t.kind === "group" ? (
                      (t.groupName ?? "Group")
                    ) : (
                      <Username anonNumber={p?.anon_number} />
                    )}
                  </div>
                  {t.last && (
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {formatDistanceToNow(new Date(t.last.created_at), { addSuffix: false })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {t.last?.body ?? "No messages yet"}
                </p>
              </div>
              {unread && <div className="size-2 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </div>
    </main>
  );
}

import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Send } from "lucide-react";
import { database } from "@/integrations/database/client";
import { Username } from "@/components/app/Username";
import { useCurrentUserId, useProfilesByIds } from "@/hooks/useProfile";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chats/$threadId")({
  head: () => ({ meta: [{ title: "Chat — Whisper" }] }),
  component: ChatPage,
});

function ChatPage() {
  const { threadId } = Route.useParams();
  const me = useCurrentUserId();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const threadQ = useQuery({
    queryKey: ["thread-info", threadId],
    queryFn: async () => {
      const { data, error } = await database
        .from("chat_threads")
        .select("id, kind, group_id")
        .eq("id", threadId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      if (!data.group_id) return { ...data, groups: null };
      const { data: group, error: groupError } = await database
        .from("groups")
        .select("name")
        .eq("id", data.group_id)
        .maybeSingle();
      if (groupError) throw groupError;
      return { ...data, groups: group };
    },
  });

  const partsQ = useQuery({
    queryKey: ["thread-parts", threadId],
    queryFn: async () => {
      const { data } = await database
        .from("chat_participants")
        .select("user_id")
        .eq("thread_id", threadId);
      return data ?? [];
    },
  });

  const msgsQ = useQuery({
    queryKey: ["messages", threadId],
    queryFn: async () => {
      const { data, error } = await database
        .from("messages")
        .select("id, sender_id, body, created_at")
        .eq("thread_id", threadId)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data;
    },
    refetchInterval: 3_000,
  });

  const otherId = partsQ.data?.find((p) => p.user_id !== me)?.user_id;
  const profs = useProfilesByIds([
    ...new Set([...(msgsQ.data ?? []).map((m) => m.sender_id), ...(otherId ? [otherId] : [])]),
  ]);
  const otherProf = otherId ? profs.data?.get(otherId) : undefined;

  // Mark the conversation as read.
  useEffect(() => {
    if (me) {
      database
        .from("chat_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("thread_id", threadId)
        .eq("user_id", me)
        .then(() => {});
    }
  }, [threadId, me]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgsQ.data?.length]);

  async function send() {
    if (!me || !text.trim()) return;
    const v = text.trim();
    setText("");
    const { error } = await database
      .from("messages")
      .insert({ thread_id: threadId, sender_id: me, body: v });
    if (error) {
      setText(v);
      toast.error(error.message);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 flex flex-col h-[100vh] pb-32 lg:pb-6">
      <header className="flex items-center gap-3 mb-3">
        <button
          onClick={() => navigate({ to: "/chats" })}
          className="size-10 rounded-full glass flex items-center justify-center"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="size-10 rounded-full gradient-primary-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
          {threadQ.data?.kind === "group"
            ? "#"
            : (otherProf?.anon_number ?? "?").toString().slice(-2)}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold truncate">
            {threadQ.data?.kind === "group" ? (
              (threadQ.data.groups?.name ?? "Group")
            ) : (
              <Username anonNumber={otherProf?.anon_number} />
            )}
          </h1>
          <p className="text-[11px] text-muted-foreground">Anonymous · end-to-name-private</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto space-y-2 glass-strong rounded-3xl p-3">
        {msgsQ.data?.length === 0 && (
          <div className="text-center text-xs text-muted-foreground py-10">
            Say hi — they don't know who you are.
          </div>
        )}
        {msgsQ.data?.map((m) => {
          const mine = m.sender_id === me;
          return (
            <div
              key={m.id}
              className={`animate-float-up flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm max-w-[80%] ${mine ? "gradient-primary-bg text-primary-foreground" : "glass"}`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="mt-2 flex gap-2 items-end">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type a message…"
          maxLength={4000}
          className="flex-1 glass-strong rounded-2xl px-3 py-2.5 outline-none border border-border resize-none text-sm"
        />
        <button
          onClick={send}
          disabled={!text.trim()}
          className="size-11 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground disabled:opacity-50 shrink-0"
        >
          <Send className="size-4" />
        </button>
      </div>
    </main>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Bookmark, Share2, Flag, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { openPrivateReplyThread } from "@/lib/threads.functions";
import { REACTIONS, type ReactionKind } from "@/lib/categories";
import { Username } from "./Username";
import { useCurrentUserId, useProfilesByIds } from "@/hooks/useProfile";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export type ConfessionRow = {
  id: string;
  author_id: string;
  group_id: string | null;
  category: string;
  mood: string | null;
  body: string;
  created_at: string;
};

export function ConfessionCard({ confession, index = 0 }: { confession: ConfessionRow; index?: number }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const me = useCurrentUserId();
  const openThread = useServerFn(openPrivateReplyThread);
  const profilesQ = useProfilesByIds([confession.author_id]);
  const author = profilesQ.data?.get(confession.author_id);
  const [reportOpen, setReportOpen] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);

  const reactionsQ = useQuery({
    queryKey: ["reactions", confession.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reactions").select("kind, user_id").eq("confession_id", confession.id);
      if (error) throw error;
      return data;
    },
    staleTime: 30_000,
  });

  const bookmarkedQ = useQuery({
    queryKey: ["bookmark", confession.id, me],
    enabled: !!me,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookmarks").select("user_id").eq("user_id", me!).eq("confession_id", confession.id).maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  const counts = (reactionsQ.data ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.kind] = (acc[r.kind] ?? 0) + 1; return acc;
  }, {});
  const myReactions = new Set((reactionsQ.data ?? []).filter((r) => r.user_id === me).map((r) => r.kind));

  const toggleReaction = useMutation({
    mutationFn: async (kind: ReactionKind) => {
      if (!me) throw new Error("Sign in required");
      if (myReactions.has(kind)) {
        const { error } = await supabase
          .from("reactions").delete().eq("confession_id", confession.id).eq("user_id", me).eq("kind", kind);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reactions").insert({ confession_id: confession.id, user_id: me, kind });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reactions", confession.id] }),
    onError: (e: any) => toast.error(e.message),
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (!me) throw new Error("Sign in required");
      if (bookmarkedQ.data) {
        const { error } = await supabase
          .from("bookmarks").delete().eq("user_id", me).eq("confession_id", confession.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("bookmarks").insert({ user_id: me, confession_id: confession.id });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookmark", confession.id] }),
  });

  async function replyPrivately() {
    if (!me) {
      toast.error("Sign in required");
      return;
    }
    if (me === confession.author_id) {
      toast.error("You can't privately reply to yourself.");
      return;
    }

    setReplyLoading(true);
    try {
      const { threadId } = await openThread({ data: { confessionId: confession.id } });
      await qc.invalidateQueries({ queryKey: ["chat-threads", me] });
      navigate({ to: "/chats/$threadId", params: { threadId } });
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't open chat");
    } finally {
      setReplyLoading(false);
    }
  }

  async function share() {
    try {
      const url = `${window.location.origin}/feed?c=${confession.id}`;
      if (navigator.share) await navigator.share({ text: confession.body.slice(0, 80), url });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch {}
  }

  async function report(reason: string) {
    if (!me) return;
    const { error } = await supabase.from("reports").insert({
      reporter_id: me, target_type: "confession", target_id: confession.id, reason,
    });
    if (error) toast.error(error.message); else toast.success("Reported. Thanks.");
    setReportOpen(false);
  }

  const likeCount = counts["like"] ?? 0;
  const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.2) }}
      className="glass rounded-3xl p-5 relative"
    >
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full gradient-primary-bg flex items-center justify-center text-xs font-bold text-primary-foreground">
            {(author?.anon_number ?? "?").toString().slice(-2)}
          </div>
          <div className="leading-tight">
            <Username anonNumber={author?.anon_number} isGuest={author?.is_guest} className="text-sm" />
            <div className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(new Date(confession.created_at), { addSuffix: true })}
              <span className="mx-1.5">·</span>
              <span className="text-foreground/70">{confession.category}</span>
              {confession.mood ? <span className="ml-1">{confession.mood}</span> : null}
            </div>
          </div>
        </div>
        <button onClick={() => setReportOpen((v) => !v)} className="p-2 rounded-full hover:bg-accent/50 text-muted-foreground">
          <MoreHorizontal className="size-4" />
        </button>
      </header>

      <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/95">{confession.body}</p>

      {/* Reactions */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {REACTIONS.map((r) => {
          const active = myReactions.has(r.kind);
          const n = counts[r.kind] ?? 0;
          return (
            <button key={r.kind} onClick={() => toggleReaction.mutate(r.kind)}
              className={`text-xs rounded-full px-2.5 py-1 border transition flex items-center gap-1 ${
                active ? "bg-primary/20 border-primary/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground"
              }`}>
              <span>{r.emoji}</span>{n > 0 && <span>{n}</span>}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <footer className="mt-4 pt-3 border-t border-border flex items-center justify-between text-muted-foreground text-sm">
        <button
          onClick={replyPrivately}
          disabled={replyLoading || me === confession.author_id}
          className="flex items-center gap-1.5 hover:text-foreground transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageCircle className="size-4" /> {replyLoading ? "Opening..." : "Reply privately"}
        </button>
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-accent/50">
            <Heart className="size-4" /> <span className="text-xs">{likeCount || totalReactions}</span>
          </button>
          <button onClick={() => toggleBookmark.mutate()}
            className={`p-2 rounded-full hover:bg-accent/50 ${bookmarkedQ.data ? "text-primary" : ""}`}>
            <Bookmark className="size-4" fill={bookmarkedQ.data ? "currentColor" : "none"} />
          </button>
          <button onClick={share} className="p-2 rounded-full hover:bg-accent/50">
            <Share2 className="size-4" />
          </button>
        </div>
      </footer>

      {reportOpen && (
        <div className="absolute right-4 top-12 glass-strong rounded-2xl p-2 z-10 text-sm w-44 animate-float-up">
          {["Spam", "Harassment", "Hate speech", "NSFW", "Violence", "False info"].map((r) => (
            <button key={r} onClick={() => report(r)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-accent/60 flex items-center gap-2">
              <Flag className="size-3.5" /> {r}
            </button>
          ))}
        </div>
      )}
    </motion.article>
  );
}

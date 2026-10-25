import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { moderateConfession } from "@/lib/moderation.functions";
import { CATEGORIES, MOODS, type Category } from "@/lib/categories";
import { useCurrentUserId } from "@/hooks/useProfile";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/post")({
  head: () => ({ meta: [{ title: "New confession — Whisper" }] }),
  component: PostPage,
});

function PostPage() {
  const navigate = useNavigate();
  const me = useCurrentUserId();
  const moderate = useServerFn(moderateConfession);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<Category>("Random");
  const [mood, setMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!me) return;
    if (body.trim().length < 3) { toast.error("Say a bit more."); return; }
    setLoading(true);
    try {
      const mod = await moderate({ data: { body } });
      if (!mod.allowed) {
        toast.error(`Blocked: ${mod.reasons.join(", ") || "violates content rules"}`);
        setLoading(false); return;
      }
      const { error } = await supabase.from("confessions").insert({
        author_id: me, body: body.trim(), category, mood, group_id: null,
      });
      if (error) throw error;
      toast.success("Confession shared anonymously.");
      navigate({ to: "/feed" });
    } catch (e: any) {
      toast.error(e.message ?? "Couldn't post");
    } finally { setLoading(false); }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pt-6 lg:pt-10">
      <header className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate({ to: "/feed" })} className="size-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-xl font-bold">New confession</h1>
      </header>

      <div className="glass-strong animate-float-up rounded-3xl p-5">
        <textarea value={body} onChange={(e) => setBody(e.target.value)}
          maxLength={2000} rows={7} autoFocus
          placeholder="What do you want to confess? It stays anonymous."
          className="w-full bg-transparent outline-none resize-none placeholder:text-muted-foreground" />
        <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
          <span className="flex items-center gap-1"><Sparkles className="size-3" /> AI-moderated</span>
          <span>{body.length}/2000</span>
        </div>
      </div>

      <section className="mt-5">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Category</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                category === c ? "gradient-primary-bg text-primary-foreground border-transparent font-semibold" : "glass text-muted-foreground border-border"
              }`}>{c}</button>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Mood (optional)</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMood(null)}
            className={`text-xs px-3 py-1.5 rounded-full border ${mood === null ? "bg-primary/20 border-primary/60" : "glass border-border"}`}>None</button>
          {MOODS.map((m) => (
            <button key={m} onClick={() => setMood(m)}
              className={`text-lg size-10 rounded-full border ${mood === m ? "bg-primary/20 border-primary/60" : "glass border-border"}`}>{m}</button>
          ))}
        </div>
      </section>

      <button onClick={submit} disabled={loading || body.trim().length < 3}
        className="mt-6 w-full rounded-2xl gradient-primary-bg py-3 font-semibold text-primary-foreground disabled:opacity-50">
        {loading ? "Posting…" : "Post anonymously"}
      </button>
    </main>
  );
}

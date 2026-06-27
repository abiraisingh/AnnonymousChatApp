import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConfessionCard, type ConfessionRow } from "@/components/app/ConfessionCard";
import { CATEGORIES } from "@/lib/categories";
import { useCurrentUserId } from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({
    meta: [
      { title: "Feed — Whisper" },
      { name: "description", content: "Latest anonymous confessions." },
    ],
  }),
  component: FeedPage,
});

type Tab = "latest" | "trending" | "bookmarks";

function FeedPage() {
  const me = useCurrentUserId();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("latest");
  const [category, setCategory] = useState<string | null>(null);

  const feedQ = useQuery({
    queryKey: ["feed", tab, category, me],
    queryFn: async (): Promise<ConfessionRow[]> => {
      if (tab === "bookmarks") {
        if (!me) return [];
        const { data, error } = await supabase
          .from("bookmarks")
          .select("confessions(*)")
          .eq("user_id", me)
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        return (data ?? []).map((r: any) => r.confessions).filter(Boolean);
      }
      let q = supabase
        .from("confessions")
        .select("*")
        .is("group_id", null)
        .order("created_at", { ascending: false })
        .limit(60);
      if (category) q = q.eq("category", category);
      const { data, error } = await q;
      if (error) throw error;
      let rows = data as ConfessionRow[];
      if (tab === "trending") {
        // Rank by recent reactions
        const ids = rows.map((r) => r.id);
        if (ids.length) {
          const { data: rxs } = await supabase
            .from("reactions").select("confession_id").in("confession_id", ids);
          const score = new Map<string, number>();
          (rxs ?? []).forEach((r: any) => score.set(r.confession_id, (score.get(r.confession_id) ?? 0) + 1));
          rows = [...rows].sort((a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0));
        }
      }
      return rows;
    },
  });

  // Realtime: refresh feed on new confessions / reactions
  useEffect(() => {
    const ch = supabase
      .channel("feed-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "confessions" }, () => {
        qc.invalidateQueries({ queryKey: ["feed"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions" }, (payload: any) => {
        const cid = payload.new?.confession_id ?? payload.old?.confession_id;
        if (cid) qc.invalidateQueries({ queryKey: ["reactions", cid] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return (
    <main className="mx-auto max-w-md px-4 pt-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          <span className="gradient-text">Whisper</span>
        </h1>
        <div className="flex items-center gap-2">
          <Link to="/search" className="size-10 rounded-full glass flex items-center justify-center">
            <Search className="size-4" />
          </Link>
          <Link to="/profile" className="size-10 rounded-full glass flex items-center justify-center">
            <Bell className="size-4" />
          </Link>
        </div>
      </header>

      <div className="glass rounded-full p-1 flex text-sm mb-3">
        {(["latest", "trending", "bookmarks"] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-full capitalize transition ${
              tab === t ? "gradient-primary-bg text-primary-foreground font-semibold" : "text-muted-foreground"
            }`}>{t}</button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CatChip label="All" active={category === null} onClick={() => setCategory(null)} />
        {CATEGORIES.map((c) => (
          <CatChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>

      <div className="space-y-3 pb-6">
        {feedQ.isLoading && (
          <div className="space-y-3">
            {[0,1,2].map((i) => <div key={i} className="glass rounded-3xl h-40 animate-pulse" />)}
          </div>
        )}
        {feedQ.data && feedQ.data.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-3xl p-8 text-center text-muted-foreground">
            <p className="text-sm">No confessions yet. Be the first to share.</p>
            <Link to="/post" className="mt-4 inline-block rounded-full gradient-primary-bg px-5 py-2 text-sm font-semibold text-primary-foreground">
              Write a confession
            </Link>
          </motion.div>
        )}
        {feedQ.data?.map((c, i) => <ConfessionCard key={c.id} confession={c} index={i} />)}
      </div>
    </main>
  );
}

function CatChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 text-xs px-3.5 py-1.5 rounded-full border whitespace-nowrap transition ${
        active ? "gradient-primary-bg text-primary-foreground border-transparent font-semibold" : "glass text-muted-foreground border-border"
      }`}>{label}</button>
  );
}

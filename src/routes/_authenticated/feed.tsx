import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConfessionCard, type ConfessionRow } from "@/components/app/ConfessionCard";
import { CATEGORIES } from "@/lib/categories";
import {
  EMPTY_CONFESSION_INTERACTIONS,
  useConfessionInteractions,
  useCurrentUserId,
} from "@/hooks/useProfile";

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
    queryKey: ["feed", tab, category, tab === "bookmarks" ? me : null],
    enabled: tab !== "bookmarks" || !!me,
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

  const interactionsQ = useConfessionInteractions(feedQ.data ?? [], me);
  const interactions = interactionsQ.data ?? EMPTY_CONFESSION_INTERACTIONS;

  // Realtime: refresh feed on new confessions / reactions
  useEffect(() => {
    const ch = supabase
      .channel("feed-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "confessions" }, () => {
        qc.invalidateQueries({ queryKey: ["feed"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions" }, () => {
        qc.invalidateQueries({ queryKey: ["confession-interactions"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12 lg:pt-10">
      <header className="mb-6 flex items-center justify-between lg:hidden">
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

      <div className="lg:grid lg:grid-cols-[minmax(0,640px)] lg:justify-center lg:gap-6 xl:grid-cols-[180px_minmax(0,640px)] 2xl:grid-cols-[200px_minmax(0,640px)_240px] 2xl:gap-8">
        <aside className="mb-5 lg:col-start-1 lg:row-start-1 lg:flex lg:flex-wrap lg:items-start lg:gap-x-4 xl:sticky xl:top-8 xl:col-auto xl:row-auto xl:mb-0 xl:block xl:self-start">
          <h2 className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground xl:block">Your feed</h2>
          <div className="glass mb-3 flex w-full rounded-full p-1 text-sm xl:flex-col xl:rounded-2xl xl:p-2">
            {(["latest", "trending", "bookmarks"] as Tab[]).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 rounded-full py-2 capitalize transition xl:flex-none xl:w-full xl:rounded-xl xl:px-3 xl:py-2.5 xl:text-left ${
                  tab === t ? "gradient-primary-bg font-semibold text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}>{t}</button>
            ))}
          </div>

          <div className="flex min-w-0 gap-2 overflow-x-auto pb-3 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex lg:flex-1 lg:flex-nowrap lg:mx-0 lg:px-0 xl:hidden">
            <CatChip label="All" active={category === null} onClick={() => setCategory(null)} />
            {CATEGORIES.map((c) => (
              <CatChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </div>
          <div className="hidden space-y-1 xl:block">
            <CatChip label="All topics" active={category === null} onClick={() => setCategory(null)} />
            {CATEGORIES.map((c) => (
              <CatChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </div>
        </aside>

        <section className="min-w-0 space-y-3">
          <header className="mb-5 hidden items-center justify-between lg:flex">
            <div>
              <h1 className="text-3xl font-bold">The feed</h1>
              <p className="mt-1 text-sm text-muted-foreground">Honest thoughts, shared anonymously.</p>
            </div>
            <Link to="/search" aria-label="Search" className="flex size-10 items-center justify-center rounded-xl glass transition hover:bg-accent/60">
              <Search className="size-4" />
            </Link>
          </header>
          {feedQ.isLoading && (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => <div key={i} className="glass h-40 animate-pulse rounded-3xl" />)}
            </div>
          )}
          {feedQ.data && feedQ.data.length === 0 && (
            <div className="glass animate-float-up rounded-3xl p-8 text-center text-muted-foreground">
              <p className="text-sm">No confessions yet. Be the first to share.</p>
              <Link to="/post" className="mt-4 inline-block rounded-full gradient-primary-bg px-5 py-2 text-sm font-semibold text-primary-foreground">
                Write a confession
              </Link>
            </div>
          )}
          {feedQ.data?.map((c, i) => (
            <ConfessionCard key={c.id} confession={c} index={i} interactions={interactions} />
          ))}
        </section>

        <aside className="sticky top-8 hidden self-start space-y-4 2xl:block">
          <section className="glass rounded-2xl p-5">
            <h2 className="font-display text-lg font-semibold">Something on your mind?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Put it into words. Your identity stays yours.</p>
            <Link to="/post" className="mt-4 flex items-center justify-center rounded-xl gradient-primary-bg px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              Write anonymously
            </Link>
          </section>
          <p className="px-2 text-xs leading-relaxed text-muted-foreground">Keep this space thoughtful. Treat every confession with care.</p>
        </aside>
      </div>
    </main>
  );
}

function CatChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs whitespace-nowrap transition xl:w-full xl:rounded-xl xl:border-transparent xl:px-3 xl:py-2 xl:text-left ${
        active ? "gradient-primary-bg font-semibold text-primary-foreground" : "glass text-muted-foreground border-border xl:bg-transparent xl:shadow-none hover:text-foreground"
      }`}>{label}</button>
  );
}

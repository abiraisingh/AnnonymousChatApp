import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search as SearchIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ConfessionCard, type ConfessionRow } from "@/components/app/ConfessionCard";
import { Username } from "@/components/app/Username";
import {
  EMPTY_CONFESSION_INTERACTIONS,
  useConfessionInteractions,
  useCurrentUserId,
} from "@/hooks/useProfile";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({ meta: [{ title: "Search — Whisper" }] }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();
  const me = useCurrentUserId();
  const [q, setQ] = useState("");

  const numMatch = q.match(/^user\s*(\d+)$/i);
  const numericId = numMatch ? Number(numMatch[1]) : null;

  const confessionsQ = useQuery({
    queryKey: ["search-confessions", q],
    enabled: q.trim().length > 1 && !numericId,
    queryFn: async (): Promise<ConfessionRow[]> => {
      const { data, error } = await supabase
        .from("confessions").select("*").is("group_id", null)
        .ilike("body", `%${q.trim()}%`).order("created_at", { ascending: false }).limit(30);
      if (error) throw error;
      return data as ConfessionRow[];
    },
  });

  const groupsQ = useQuery({
    queryKey: ["search-groups", q],
    enabled: q.trim().length > 1 && !numericId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups").select("id, name, category, is_private").ilike("name", `%${q.trim()}%`).limit(15);
      if (error) throw error;
      return data;
    },
  });

  const userQ = useQuery({
    queryKey: ["search-user", numericId],
    enabled: !!numericId,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, anon_number, is_guest").eq("anon_number", numericId!).maybeSingle();
      return data;
    },
  });

  const interactionsQ = useConfessionInteractions(confessionsQ.data ?? [], me);
  const interactions = interactionsQ.data ?? EMPTY_CONFESSION_INTERACTIONS;

  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 lg:pt-10">
      <header className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate({ to: "/feed" })} className="size-10 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="size-4" />
        </button>
        <div className="flex-1 glass rounded-full px-4 py-2.5 flex items-center gap-2">
          <SearchIcon className="size-4 text-muted-foreground" />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search confessions, groups, User1234" className="flex-1 bg-transparent outline-none text-sm" />
        </div>
      </header>

      {numericId && userQ.data && (
        <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-3">
          <div className="size-10 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold">
            {userQ.data.anon_number.toString().slice(-2)}
          </div>
          <Username anonNumber={userQ.data.anon_number} isGuest={userQ.data.is_guest} />
        </div>
      )}

      {groupsQ.data && groupsQ.data.length > 0 && (
        <section className="mb-5">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Groups</h2>
          <div className="space-y-2">
            {groupsQ.data.map((g) => (
              <Link key={g.id} to="/groups/$groupId" params={{ groupId: g.id }} className="glass rounded-2xl p-3 flex items-center gap-3 block">
                <div className="size-9 rounded-xl gradient-primary-bg flex items-center justify-center text-primary-foreground text-sm font-bold">
                  {g.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{g.name}</div>
                  <div className="text-[11px] text-muted-foreground">{g.category ?? "Community"}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {confessionsQ.data && confessionsQ.data.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Confessions</h2>
          <div className="space-y-3 pb-6">
            {confessionsQ.data.map((c, i) => (
              <ConfessionCard key={c.id} confession={c} index={i} interactions={interactions} />
            ))}
          </div>
        </section>
      )}

      {q.length > 1 && !confessionsQ.isLoading && !groupsQ.isLoading
        && (confessionsQ.data?.length ?? 0) === 0 && (groupsQ.data?.length ?? 0) === 0 && !userQ.data && (
        <div className="text-center text-sm text-muted-foreground mt-10">No results.</div>
      )}
    </main>
  );
}

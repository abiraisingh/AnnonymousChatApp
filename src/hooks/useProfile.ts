import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCurrentUserId() {
  const { data } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
    staleTime: 60_000,
  });
  return data?.id ?? null;
}

export function useProfile(userId: string | null) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, anon_number, is_guest, notifications_enabled, created_at")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useMyProfile() {
  const uid = useCurrentUserId();
  return useProfile(uid);
}

export function useProfilesByIds(ids: string[]) {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  return useQuery({
    queryKey: ["profiles", unique.sort().join(",")],
    enabled: unique.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, anon_number, is_guest")
        .in("id", unique);
      if (error) throw error;
      const map = new Map<string, { id: string; anon_number: number; is_guest: boolean }>();
      for (const p of data) map.set(p.id, p);
      return map;
    },
  });
}

type ConfessionReference = { id: string; author_id: string };

export type ConfessionInteractions = {
  profiles: Map<string, { id: string; anon_number: number; is_guest: boolean }>;
  reactions: { confession_id: string; kind: string; user_id: string }[];
  bookmarkedIds: Set<string>;
};

export const EMPTY_CONFESSION_INTERACTIONS: ConfessionInteractions = {
  profiles: new Map(),
  reactions: [],
  bookmarkedIds: new Set(),
};

export function useConfessionInteractions(confessions: ConfessionReference[], userId: string | null) {
  const confessionIds = Array.from(new Set(confessions.map((confession) => confession.id))).sort();
  const authorIds = Array.from(new Set(confessions.map((confession) => confession.author_id))).sort();

  const interactionQuery = useQuery({
    queryKey: ["confession-interactions", confessionIds.join(","), authorIds.join(",")],
    enabled: confessionIds.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      const [profilesResult, reactionsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, anon_number, is_guest")
          .in("id", authorIds),
        supabase
          .from("reactions")
          .select("confession_id, kind, user_id")
          .in("confession_id", confessionIds),
      ]);

      if (profilesResult.error) throw profilesResult.error;
      if (reactionsResult.error) throw reactionsResult.error;

      return {
        profiles: new Map(profilesResult.data.map((profile) => [profile.id, profile] as const)),
        reactions: reactionsResult.data,
      };
    },
  });

  const bookmarksQuery = useQuery({
    queryKey: ["confession-bookmarks", confessionIds.join(","), userId],
    enabled: confessionIds.length > 0 && !!userId,
    staleTime: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookmarks")
        .select("confession_id")
        .eq("user_id", userId!)
        .in("confession_id", confessionIds);
      if (error) throw error;
      return new Set((data ?? []).map((bookmark) => bookmark.confession_id));
    },
  });

  return {
    data: interactionQuery.data
      ? { ...interactionQuery.data, bookmarkedIds: bookmarksQuery.data ?? EMPTY_CONFESSION_INTERACTIONS.bookmarkedIds }
      : undefined,
  };
}

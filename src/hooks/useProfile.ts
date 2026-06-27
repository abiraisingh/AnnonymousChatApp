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

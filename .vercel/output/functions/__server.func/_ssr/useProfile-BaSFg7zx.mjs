import { i as database } from "./router-CUD1but5.mjs";
import { n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
// node_modules/.nitro/vite/services/ssr/assets/useProfile-BaSFg7zx.js
function useCurrentUserId() {
	const { data } = useQuery({
		queryKey: ["auth", "user"],
		queryFn: async () => (await database.auth.getUser()).data.user,
		staleTime: 0
	});
	return data?.id ?? null;
}
function useProfile(userId) {
	return useQuery({
		queryKey: ["profile", userId],
		enabled: !!userId,
		queryFn: async () => {
			const { data, error } = await database.from("profiles").select("id, anon_number, is_guest, notifications_enabled, created_at").eq("id", userId).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
}
function useMyProfile() {
	return useProfile(useCurrentUserId());
}
function useProfilesByIds(ids) {
	const unique = Array.from(new Set(ids.filter(Boolean)));
	return useQuery({
		queryKey: ["profiles", unique.sort().join(",")],
		enabled: unique.length > 0,
		queryFn: async () => {
			const { data, error } = await database.from("profiles").select("id, anon_number, is_guest").in("id", unique);
			if (error) throw error;
			const map = /* @__PURE__ */ new Map();
			for (const p of data) map.set(p.id, p);
			return map;
		}
	});
}
var EMPTY_CONFESSION_INTERACTIONS = {
	profiles: /* @__PURE__ */ new Map(),
	reactions: [],
	bookmarkedIds: /* @__PURE__ */ new Set()
};
function useConfessionInteractions(confessions, userId) {
	const confessionIds = Array.from(new Set(confessions.map((confession) => confession.id))).sort();
	const authorIds = Array.from(new Set(confessions.map((confession) => confession.author_id))).sort();
	const interactionQuery = useQuery({
		queryKey: [
			"confession-interactions",
			confessionIds.join(","),
			authorIds.join(",")
		],
		enabled: confessionIds.length > 0,
		staleTime: 3e4,
		queryFn: async () => {
			const [profilesResult, reactionsResult] = await Promise.all([database.from("profiles").select("id, anon_number, is_guest").in("id", authorIds), database.from("reactions").select("confession_id, kind, user_id").in("confession_id", confessionIds)]);
			if (profilesResult.error) throw profilesResult.error;
			if (reactionsResult.error) throw reactionsResult.error;
			return {
				profiles: new Map(profilesResult.data.map((profile) => [profile.id, profile])),
				reactions: reactionsResult.data
			};
		}
	});
	const bookmarksQuery = useQuery({
		queryKey: [
			"confession-bookmarks",
			confessionIds.join(","),
			userId
		],
		enabled: confessionIds.length > 0 && !!userId,
		staleTime: 3e4,
		queryFn: async () => {
			const { data, error } = await database.from("bookmarks").select("confession_id").eq("user_id", userId).in("confession_id", confessionIds);
			if (error) throw error;
			return new Set((data ?? []).map((bookmark) => bookmark.confession_id));
		}
	});
	return { data: interactionQuery.data ? {
		...interactionQuery.data,
		bookmarkedIds: bookmarksQuery.data ?? EMPTY_CONFESSION_INTERACTIONS.bookmarkedIds
	} : void 0 };
}
export { useProfilesByIds as a, useMyProfile as i, useConfessionInteractions as n, useCurrentUserId as r, EMPTY_CONFESSION_INTERACTIONS as t };

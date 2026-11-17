import { o as __toESM } from "../_runtime.mjs";
import { i as database } from "./router-CUD1but5.mjs";
import { t as ConfessionCard } from "./ConfessionCard-DffKreAY.mjs";
import { t as Username } from "./Username-Bx8lDg2s.mjs";
import { n as useConfessionInteractions, r as useCurrentUserId, t as EMPTY_CONFESSION_INTERACTIONS } from "./useProfile-BaSFg7zx.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as ArrowLeft, c as Search } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/search-eO99svNL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SearchPage() {
	const navigate = useNavigate();
	const me = useCurrentUserId();
	const [q, setQ] = (0, import_react.useState)("");
	const numMatch = q.match(/^user\s*(\d+)$/i);
	const numericId = numMatch ? Number(numMatch[1]) : null;
	const confessionsQ = useQuery({
		queryKey: ["search-confessions", q],
		enabled: q.trim().length > 1 && !numericId,
		queryFn: async () => {
			const { data, error } = await database.from("confessions").select("*").is("group_id", null).ilike("body", `%${q.trim()}%`).order("created_at", { ascending: false }).limit(30);
			if (error) throw error;
			return data;
		}
	});
	const groupsQ = useQuery({
		queryKey: ["search-groups", q],
		enabled: q.trim().length > 1 && !numericId,
		queryFn: async () => {
			const { data, error } = await database.from("groups").select("id, name, category, is_private").ilike("name", `%${q.trim()}%`).limit(15);
			if (error) throw error;
			return data;
		}
	});
	const userQ = useQuery({
		queryKey: ["search-user", numericId],
		enabled: !!numericId,
		queryFn: async () => {
			const { data } = await database.from("profiles").select("id, anon_number, is_guest").eq("anon_number", numericId).maybeSingle();
			return data;
		}
	});
	const interactions = useConfessionInteractions(confessionsQ.data ?? [], me).data ?? EMPTY_CONFESSION_INTERACTIONS;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 pt-6 lg:pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-2 mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => navigate({ to: "/feed" }),
					className: "size-10 rounded-full glass flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 glass rounded-full px-4 py-2.5 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						autoFocus: true,
						value: q,
						onChange: (e) => setQ(e.target.value),
						placeholder: "Search confessions, groups, User1234",
						className: "flex-1 bg-transparent outline-none text-sm"
					})]
				})]
			}),
			numericId && userQ.data && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass rounded-2xl p-4 mb-4 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-10 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground text-xs font-bold",
					children: userQ.data.anon_number.toString().slice(-2)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Username, {
					anonNumber: userQ.data.anon_number,
					isGuest: userQ.data.is_guest
				})]
			}),
			groupsQ.data && groupsQ.data.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs uppercase tracking-wider text-muted-foreground mb-2",
					children: "Groups"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-2",
					children: groupsQ.data.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/groups/$groupId",
						params: { groupId: g.id },
						className: "glass rounded-2xl p-3 flex items-center gap-3 block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-9 rounded-xl gradient-primary-bg flex items-center justify-center text-primary-foreground text-sm font-bold",
							children: g.name.charAt(0).toUpperCase()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold truncate",
								children: g.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground",
								children: g.category ?? "Community"
							})]
						})]
					}, g.id))
				})]
			}),
			confessionsQ.data && confessionsQ.data.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xs uppercase tracking-wider text-muted-foreground mb-2",
				children: "Confessions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3 pb-6",
				children: confessionsQ.data.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfessionCard, {
					confession: c,
					index: i,
					interactions
				}, c.id))
			})] }),
			q.length > 1 && !confessionsQ.isLoading && !groupsQ.isLoading && (confessionsQ.data?.length ?? 0) === 0 && (groupsQ.data?.length ?? 0) === 0 && !userQ.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-center text-sm text-muted-foreground mt-10",
				children: "No results."
			})
		]
	});
}
export { SearchPage as component };

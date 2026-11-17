import { o as __toESM } from "../_runtime.mjs";
import { i as database } from "./router-CUD1but5.mjs";
import { t as ConfessionCard } from "./ConfessionCard-DffKreAY.mjs";
import { t as CATEGORIES } from "./categories-kVw_BVXO.mjs";
import { n as useConfessionInteractions, r as useCurrentUserId, t as EMPTY_CONFESSION_INTERACTIONS } from "./useProfile-BaSFg7zx.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as Search, w as Bell } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/feed-DQayPBUV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FeedPage() {
	const navigate = useNavigate();
	const me = useCurrentUserId();
	const [tab, setTab] = (0, import_react.useState)("latest");
	const [category, setCategory] = (0, import_react.useState)(null);
	const feedQ = useQuery({
		queryKey: [
			"feed",
			tab,
			category,
			tab === "bookmarks" ? me : null
		],
		enabled: tab !== "bookmarks" || !!me,
		queryFn: async () => {
			if (tab === "bookmarks") {
				if (!me) return [];
				const { data: bookmarks, error } = await database.from("bookmarks").select("confession_id").eq("user_id", me).order("created_at", { ascending: false }).limit(50);
				if (error) throw error;
				const ids = (bookmarks ?? []).map((bookmark) => bookmark.confession_id);
				if (!ids.length) return [];
				const { data: confessions, error: confessionError } = await database.from("confessions").select("*").in("id", ids);
				if (confessionError) throw confessionError;
				const byId = new Map((confessions ?? []).map((confession) => [confession.id, confession]));
				return ids.map((id) => byId.get(id)).filter((confession) => !!confession);
			}
			let q = database.from("confessions").select("*").is("group_id", null).order("created_at", { ascending: false }).limit(60);
			if (category) q = q.eq("category", category);
			const { data, error } = await q;
			if (error) throw error;
			let rows = data;
			if (tab === "trending") {
				const ids = rows.map((r) => r.id);
				if (ids.length) {
					const { data: rxs } = await database.from("reactions").select("confession_id").in("confession_id", ids);
					const score = /* @__PURE__ */ new Map();
					(rxs ?? []).forEach((r) => score.set(r.confession_id, (score.get(r.confession_id) ?? 0) + 1));
					rows = [...rows].sort((a, b) => (score.get(b.id) ?? 0) - (score.get(a.id) ?? 0));
				}
			}
			return rows;
		},
		refetchInterval: 1e4
	});
	const interactions = useConfessionInteractions(feedQ.data ?? [], me).data ?? EMPTY_CONFESSION_INTERACTIONS;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-7xl px-4 pb-28 pt-6 lg:px-8 lg:pb-12 lg:pt-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mb-6 flex items-center justify-between lg:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "gradient-text",
					children: "Whisper"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/search",
					className: "size-10 rounded-full glass flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/profile",
					className: "size-10 rounded-full glass flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "lg:grid lg:grid-cols-[minmax(0,640px)] lg:justify-center lg:gap-6 xl:grid-cols-[180px_minmax(0,640px)] 2xl:grid-cols-[200px_minmax(0,640px)_240px] 2xl:gap-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "mb-5 lg:col-start-1 lg:row-start-1 lg:flex lg:flex-wrap lg:items-start lg:gap-x-4 xl:sticky xl:top-8 xl:col-auto xl:row-auto xl:mb-0 xl:block xl:self-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mb-3 hidden px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground xl:block",
							children: "Your feed"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "glass mb-3 flex w-full rounded-full p-1 text-sm xl:flex-col xl:rounded-2xl xl:p-2",
							children: [
								"latest",
								"trending",
								"bookmarks"
							].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									if (t === "bookmarks" && !me) {
										navigate({ to: "/auth" });
										return;
									}
									setTab(t);
								},
								className: `flex-1 rounded-full py-2 capitalize transition xl:flex-none xl:w-full xl:rounded-xl xl:px-3 xl:py-2.5 xl:text-left ${tab === t ? "gradient-primary-bg font-semibold text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`,
								children: t
							}, t))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 gap-2 overflow-x-auto pb-3 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex lg:flex-1 lg:flex-nowrap lg:mx-0 lg:px-0 xl:hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatChip, {
								label: "All",
								active: category === null,
								onClick: () => setCategory(null)
							}), CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatChip, {
								label: c,
								active: category === c,
								onClick: () => setCategory(c)
							}, c))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "hidden space-y-1 xl:block",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatChip, {
								label: "All topics",
								active: category === null,
								onClick: () => setCategory(null)
							}), CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatChip, {
								label: c,
								active: category === c,
								onClick: () => setCategory(c)
							}, c))]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "min-w-0 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "mb-5 hidden items-center justify-between lg:flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-3xl font-bold",
								children: "The feed"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Honest thoughts, shared anonymously."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/search",
								"aria-label": "Search",
								className: "flex size-10 items-center justify-center rounded-xl glass transition hover:bg-accent/60",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4" })
							})]
						}),
						feedQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: [
								0,
								1,
								2
							].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "glass h-40 animate-pulse rounded-3xl" }, i))
						}),
						feedQ.data && feedQ.data.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass animate-float-up rounded-3xl p-8 text-center text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: "No confessions yet. Be the first to share."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/post",
								className: "mt-4 inline-block rounded-full gradient-primary-bg px-5 py-2 text-sm font-semibold text-primary-foreground",
								children: "Write a confession"
							})]
						}),
						feedQ.data?.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfessionCard, {
							confession: c,
							index: i,
							interactions
						}, c.id))
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "sticky top-8 hidden self-start space-y-4 2xl:block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "glass rounded-2xl p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-lg font-semibold",
								children: "Something on your mind?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-relaxed text-muted-foreground",
								children: "Put it into words. Your identity stays yours."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/post",
								className: "mt-4 flex items-center justify-center rounded-xl gradient-primary-bg px-4 py-2.5 text-sm font-semibold text-primary-foreground",
								children: "Write anonymously"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 text-xs leading-relaxed text-muted-foreground",
						children: "Keep this space thoughtful. Treat every confession with care."
					})]
				})
			]
		})]
	});
}
function CatChip({ label, active, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		onClick,
		className: `shrink-0 rounded-full border px-3.5 py-1.5 text-xs whitespace-nowrap transition xl:w-full xl:rounded-xl xl:border-transparent xl:px-3 xl:py-2 xl:text-left ${active ? "gradient-primary-bg font-semibold text-primary-foreground" : "glass text-muted-foreground border-border xl:bg-transparent xl:shadow-none hover:text-foreground"}`,
		children: label
	});
}
export { FeedPage as component };

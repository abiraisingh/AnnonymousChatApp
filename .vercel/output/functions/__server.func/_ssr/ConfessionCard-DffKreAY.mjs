import { o as __toESM } from "../_runtime.mjs";
import { i as database, o as createSsrRpc } from "./router-CUD1but5.mjs";
import { i as createServerFn } from "./server-DQuepINt.mjs";
import { r as REACTIONS } from "./categories-kVw_BVXO.mjs";
import { l as string, s as object } from "../_libs/zod.mjs";
import { t as Username } from "./Username-Bx8lDg2s.mjs";
import { a as useProfilesByIds, r as useCurrentUserId } from "./useProfile-BaSFg7zx.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { Bt as isRedirect, S as useRouter, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { C as Bookmark, S as Ellipsis, d as MessageCircle, g as Heart, o as Share2, v as Flag } from "../_libs/lucide-react.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
// node_modules/.nitro/vite/services/ssr/assets/ConfessionCard-DffKreAY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
var Input = object({ confessionId: string().uuid() });
var openPrivateReplyThread = createServerFn({ method: "POST" }).validator((data) => Input.parse(data)).handler(createSsrRpc("5eefe3d4fe2db05c404e2d362eaa48d27c9c30f3f50ceb6dcfb6da6677bfc587"));
function ConfessionCard({ confession, index = 0, interactions }) {
	const qc = useQueryClient();
	const navigate = useNavigate();
	const me = useCurrentUserId();
	const openThread = useServerFn(openPrivateReplyThread);
	const profilesQ = useProfilesByIds(interactions ? [] : [confession.author_id]);
	const author = interactions?.profiles.get(confession.author_id) ?? profilesQ.data?.get(confession.author_id);
	const [reportOpen, setReportOpen] = (0, import_react.useState)(false);
	const [replyLoading, setReplyLoading] = (0, import_react.useState)(false);
	const reportMenuRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!reportOpen) return;
		const handlePointerDown = (event) => {
			const target = event.target;
			if (target && reportMenuRef.current && !reportMenuRef.current.contains(target)) setReportOpen(false);
		};
		const handleKeyDown = (event) => {
			if (event.key === "Escape") setReportOpen(false);
		};
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [reportOpen]);
	const reactionsQ = useQuery({
		queryKey: ["reactions", confession.id],
		enabled: !interactions,
		queryFn: async () => {
			const { data, error } = await database.from("reactions").select("kind, user_id").eq("confession_id", confession.id);
			if (error) throw error;
			return data;
		},
		staleTime: 3e4
	});
	const bookmarkedQ = useQuery({
		queryKey: [
			"bookmark",
			confession.id,
			me
		],
		enabled: !!me && !interactions,
		queryFn: async () => {
			const { data, error } = await database.from("bookmarks").select("user_id").eq("user_id", me).eq("confession_id", confession.id).maybeSingle();
			if (error) throw error;
			return !!data;
		}
	});
	const reactionRows = interactions?.reactions.filter((reaction) => reaction.confession_id === confession.id) ?? reactionsQ.data ?? [];
	const isBookmarked = interactions?.bookmarkedIds.has(confession.id) ?? bookmarkedQ.data;
	const counts = reactionRows.reduce((acc, r) => {
		acc[r.kind] = (acc[r.kind] ?? 0) + 1;
		return acc;
	}, {});
	const myReactions = new Set(me ? reactionRows.filter((r) => r.user_id === me).map((r) => r.kind) : []);
	const toggleReaction = useMutation({
		mutationFn: async (kind) => {
			if (!me) throw new Error("Sign in required");
			if (myReactions.has(kind)) {
				const { error } = await database.from("reactions").delete().eq("confession_id", confession.id).eq("user_id", me).eq("kind", kind);
				if (error) throw error;
			} else {
				const { error } = await database.from("reactions").insert({
					confession_id: confession.id,
					user_id: me,
					kind
				});
				if (error) throw error;
			}
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: interactions ? ["confession-interactions"] : ["reactions", confession.id] }),
		onError: (e) => toast.error(e.message)
	});
	const toggleBookmark = useMutation({
		mutationFn: async () => {
			if (!me) throw new Error("Sign in required");
			if (isBookmarked) {
				const { error } = await database.from("bookmarks").delete().eq("user_id", me).eq("confession_id", confession.id);
				if (error) throw error;
			} else {
				const { error } = await database.from("bookmarks").insert({
					user_id: me,
					confession_id: confession.id
				});
				if (error) throw error;
			}
		},
		onSuccess: () => qc.invalidateQueries({ queryKey: interactions ? ["confession-bookmarks"] : ["bookmark", confession.id] })
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
			navigate({
				to: "/chats/$threadId",
				params: { threadId }
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't open chat");
		} finally {
			setReplyLoading(false);
		}
	}
	async function share() {
		try {
			const url = `${window.location.origin}/feed?c=${confession.id}`;
			if (navigator.share) await navigator.share({
				text: confession.body.slice(0, 80),
				url
			});
			else {
				await navigator.clipboard.writeText(url);
				toast.success("Link copied");
			}
		} catch (error) {
			if (!(error instanceof DOMException && error.name === "AbortError")) toast.error("Couldn't share link.");
		}
	}
	async function report(reason) {
		if (!requireSignIn()) return;
		const { error } = await database.from("reports").insert({
			reporter_id: me,
			target_type: "confession",
			target_id: confession.id,
			reason
		});
		if (error) toast.error(error.message);
		else toast.success("Reported. Thanks.");
		setReportOpen(false);
	}
	const likeCount = counts["like"] ?? 0;
	const totalReactions = Object.values(counts).reduce((a, b) => a + b, 0);
	function requireSignIn() {
		if (me) return true;
		toast.error("Sign in to interact with posts.");
		navigate({ to: "/auth" });
		return false;
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		style: { animationDelay: `${Math.min(index * .03, .2)}s` },
		className: `glass animate-float-up relative rounded-3xl p-5 ${reportOpen ? "z-20" : "z-0"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between mb-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-9 rounded-full gradient-primary-bg flex items-center justify-center text-xs font-bold text-primary-foreground",
						children: (author?.anon_number ?? "?").toString().slice(-2)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "leading-tight",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Username, {
							anonNumber: author?.anon_number,
							isGuest: author?.is_guest,
							className: "text-sm"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] text-muted-foreground",
							children: [
								formatDistanceToNow(new Date(confession.created_at), { addSuffix: true }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mx-1.5",
									children: "·"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground/70",
									children: confession.category
								}),
								confession.mood ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1",
									children: confession.mood
								}) : null
							]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-expanded": reportOpen,
					"aria-haspopup": "menu",
					onClick: (event) => {
						event.stopPropagation();
						setReportOpen((v) => !v);
					},
					className: "p-2 rounded-full hover:bg-accent/50 text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/95",
				children: confession.body
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap gap-1.5",
				children: REACTIONS.map((r) => {
					const active = myReactions.has(r.kind);
					const n = counts[r.kind] ?? 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => {
							if (requireSignIn()) toggleReaction.mutate(r.kind);
						},
						className: `text-xs rounded-full px-2.5 py-1 border transition flex items-center gap-1 ${active ? "bg-primary/20 border-primary/60 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.emoji }), n > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: n })]
					}, r.kind);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mt-4 pt-3 border-t border-border flex items-center justify-between text-muted-foreground text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => {
						if (!requireSignIn()) return;
						replyPrivately();
					},
					disabled: replyLoading || me === confession.author_id,
					className: "flex items-center gap-1.5 hover:text-foreground transition disabled:cursor-not-allowed disabled:opacity-50",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }),
						" ",
						replyLoading ? "Opening..." : "Reply privately"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							className: "flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-accent/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs",
									children: likeCount || totalReactions
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"aria-label": "Bookmark post",
							onClick: () => {
								if (requireSignIn()) toggleBookmark.mutate();
							},
							className: `p-2 rounded-full hover:bg-accent/50 ${isBookmarked ? "text-primary" : ""}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, {
								className: "size-4",
								fill: isBookmarked ? "currentColor" : "none"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							"aria-label": "Share post",
							onClick: () => {
								if (requireSignIn()) share();
							},
							className: "p-2 rounded-full hover:bg-accent/50",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
						})
					]
				})]
			}),
			reportOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: reportMenuRef,
				className: "absolute right-4 top-12 glass-strong z-[70] w-44 rounded-2xl p-2 text-sm animate-float-up shadow-2xl",
				role: "menu",
				children: [
					"Spam",
					"Harassment",
					"Hate speech",
					"NSFW",
					"Violence",
					"False info"
				].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => report(r),
					className: "w-full text-left px-3 py-2 rounded-xl hover:bg-accent/60 flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-3.5" }),
						" ",
						r
					]
				}, r))
			})
		]
	});
}
export { ConfessionCard as t };

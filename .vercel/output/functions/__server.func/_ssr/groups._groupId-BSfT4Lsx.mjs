import { o as __toESM } from "../_runtime.mjs";
import { a as joinGroupRequest, i as database, n as Route } from "./router-CUD1but5.mjs";
import { t as ConfessionCard } from "./ConfessionCard-DffKreAY.mjs";
import { a as useProfilesByIds, n as useConfessionInteractions, r as useCurrentUserId, t as EMPTY_CONFESSION_INTERACTIONS } from "./useProfile-BaSFg7zx.mjs";
import { t as Username } from "./Username-Bx8lDg2s.mjs";
import { t as CATEGORIES } from "./categories-kVw_BVXO.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as ArrowLeft, _ as Hash, s as Send } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/groups._groupId-BSfT4Lsx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GroupPage() {
	const { groupId } = Route.useParams();
	const me = useCurrentUserId();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [tab, setTab] = (0, import_react.useState)("feed");
	const groupQ = useQuery({
		queryKey: ["group", groupId],
		queryFn: async () => {
			const { data, error } = await database.from("groups").select("*").eq("id", groupId).maybeSingle();
			if (error) throw error;
			return data;
		}
	});
	const membersQ = useQuery({
		queryKey: ["group-members", groupId],
		queryFn: async () => {
			const { data, error } = await database.from("group_members").select("user_id, role").eq("group_id", groupId);
			if (error) throw error;
			return data;
		},
		refetchInterval: 1e4
	});
	const isMember = !!membersQ.data?.some((m) => m.user_id === me);
	const postsQ = useQuery({
		queryKey: ["group-confessions", groupId],
		enabled: isMember,
		queryFn: async () => {
			const { data, error } = await database.from("confessions").select("*").eq("group_id", groupId).order("created_at", { ascending: false }).limit(50);
			if (error) throw error;
			return data;
		},
		refetchInterval: 1e4
	});
	const interactions = useConfessionInteractions(postsQ.data ?? [], me).data ?? EMPTY_CONFESSION_INTERACTIONS;
	const threadQ = useQuery({
		queryKey: ["group-thread", groupId],
		enabled: isMember,
		queryFn: async () => {
			const { data } = await database.from("chat_threads").select("id").eq("kind", "group").eq("group_id", groupId).maybeSingle();
			if (data) return data.id;
			const { data: t, error } = await database.from("chat_threads").insert({
				kind: "group",
				group_id: groupId
			}).select("id").single();
			if (error) throw error;
			if (!t) throw new Error("Couldn't create group chat.");
			return t.id;
		},
		refetchInterval: 1e4
	});
	async function joinGroup() {
		if (!me) return;
		try {
			await joinGroupRequest({ data: { groupId } });
			qc.invalidateQueries({ queryKey: ["group-members", groupId] });
			toast.success("Joined.");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Couldn't join group.");
		}
	}
	async function leaveGroup() {
		if (!me) return;
		const { error } = await database.from("group_members").delete().eq("group_id", groupId).eq("user_id", me);
		if (error) toast.error(error.message);
		else navigate({ to: "/groups" });
	}
	if (!groupQ.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "px-4 pt-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "glass rounded-3xl h-40 animate-pulse" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 pt-6 lg:pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 mb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => navigate({ to: "/groups" }),
						className: "size-10 rounded-full glass flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-lg font-bold truncate flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hash, { className: "size-4 text-muted-foreground" }), groupQ.data.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground truncate",
							children: [
								membersQ.data?.length ?? 0,
								" members · ",
								groupQ.data.category ?? "Community"
							]
						})]
					}),
					isMember ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: leaveGroup,
						className: "text-xs px-3 py-1.5 rounded-full glass",
						children: "Leave"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: joinGroup,
						className: "text-xs px-3 py-1.5 rounded-full gradient-primary-bg text-primary-foreground font-semibold",
						children: "Join"
					})
				]
			}),
			groupQ.data.invite_code && isMember && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass rounded-2xl p-3 mb-3 text-xs flex justify-between items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted-foreground",
					children: "Invite code"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						navigator.clipboard.writeText(groupQ.data.invite_code);
						toast.success("Copied");
					},
					className: "font-mono tracking-wider",
					children: groupQ.data.invite_code
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "glass rounded-full p-1 flex text-sm mb-4",
				children: [
					"feed",
					"chat",
					"members"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTab(t),
					className: `flex-1 py-2 rounded-full capitalize transition ${tab === t ? "gradient-primary-bg text-primary-foreground font-semibold" : "text-muted-foreground"}`,
					children: t
				}, t))
			}),
			!isMember && tab !== "members" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "glass rounded-3xl p-6 text-center text-sm text-muted-foreground",
				children: "Join this group to see posts and chat."
			}),
			isMember && tab === "feed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 pb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupComposer, {
						groupId,
						onPosted: () => qc.invalidateQueries({ queryKey: ["group-confessions", groupId] })
					}),
					postsQ.data?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "glass rounded-3xl p-6 text-center text-sm text-muted-foreground",
						children: "Be the first to post."
					}),
					postsQ.data?.map((c, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfessionCard, {
						confession: c,
						index: i,
						interactions
					}, c.id))
				]
			}),
			isMember && tab === "chat" && threadQ.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupChat, { threadId: threadQ.data }),
			tab === "members" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MembersList, { memberIds: (membersQ.data ?? []).map((m) => m.user_id) })
		]
	});
}
function GroupComposer({ groupId, onPosted }) {
	const me = useCurrentUserId();
	const [body, setBody] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("Random");
	async function post() {
		if (!me || body.trim().length < 3) return;
		const { error } = await database.from("confessions").insert({
			author_id: me,
			group_id: groupId,
			body: body.trim(),
			category,
			mood: null
		});
		if (error) toast.error(error.message);
		else {
			setBody("");
			onPosted();
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass rounded-3xl p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
			value: body,
			onChange: (e) => setBody(e.target.value),
			rows: 3,
			maxLength: 2e3,
			placeholder: "Share with the group, anonymously…",
			className: "w-full bg-transparent outline-none resize-none placeholder:text-muted-foreground text-sm"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
				value: category,
				onChange: (e) => setCategory(e.target.value),
				className: "text-xs glass rounded-full px-3 py-1.5 bg-card border-border",
				children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: c,
					children: c
				}, c))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: post,
				disabled: body.trim().length < 3,
				className: "text-sm px-4 py-2 rounded-full gradient-primary-bg text-primary-foreground font-semibold disabled:opacity-50",
				children: "Post"
			})]
		})]
	});
}
function MembersList({ memberIds }) {
	const profs = useProfilesByIds(memberIds);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2 pb-6",
		children: memberIds.map((id) => {
			const p = profs.data?.get(id);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass rounded-2xl p-3 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "size-9 rounded-full gradient-primary-bg flex items-center justify-center text-xs font-bold text-primary-foreground",
					children: (p?.anon_number ?? "?").toString().slice(-2)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Username, {
					anonNumber: p?.anon_number,
					isGuest: p?.is_guest,
					className: "text-sm"
				})]
			}, id);
		})
	});
}
function GroupChat({ threadId }) {
	const me = useCurrentUserId();
	useQueryClient();
	const [text, setText] = (0, import_react.useState)("");
	const msgsQ = useQuery({
		queryKey: ["messages", threadId],
		queryFn: async () => {
			const { data, error } = await database.from("messages").select("id, sender_id, body, created_at").eq("thread_id", threadId).order("created_at", { ascending: true }).limit(200);
			if (error) throw error;
			return data;
		},
		refetchInterval: 3e3
	});
	const senderIds = (msgsQ.data ?? []).map((m) => m.sender_id);
	const profs = useProfilesByIds(senderIds);
	async function send() {
		if (!me || !text.trim()) return;
		const v = text.trim();
		setText("");
		const { error } = await database.from("messages").insert({
			thread_id: threadId,
			sender_id: me,
			body: v
		});
		if (error) {
			setText(v);
			toast.error(error.message);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass-strong rounded-3xl p-3 flex flex-col h-[60vh]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 overflow-y-auto space-y-2 pr-1",
			children: msgsQ.data?.map((m) => {
				const mine = m.sender_id === me;
				const p = profs.data?.get(m.sender_id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `animate-float-up flex flex-col ${mine ? "items-end" : "items-start"}`,
					children: [!mine && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Username, {
						anonNumber: p?.anon_number,
						className: "text-[10px] mb-0.5"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `rounded-2xl px-3 py-2 text-sm max-w-[80%] ${mine ? "gradient-primary-bg text-primary-foreground" : "glass"}`,
						children: m.body
					})]
				}, m.id);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 flex gap-2 items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				value: text,
				onChange: (e) => setText(e.target.value),
				rows: 1,
				onKeyDown: (e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						send();
					}
				},
				placeholder: "Message the group…",
				className: "flex-1 bg-input/60 rounded-2xl px-3 py-2 outline-none border border-border resize-none text-sm"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: send,
				disabled: !text.trim(),
				className: "size-10 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground disabled:opacity-50",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
			})]
		})]
	});
}
export { GroupPage as component };

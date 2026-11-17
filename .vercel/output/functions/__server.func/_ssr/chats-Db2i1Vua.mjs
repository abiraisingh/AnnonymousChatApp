import { i as database } from "./router-CUD1but5.mjs";
import { t as Username } from "./Username-Bx8lDg2s.mjs";
import { a as useProfilesByIds, r as useCurrentUserId } from "./useProfile-BaSFg7zx.mjs";
import { b as Link, g as Outlet, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { u as MessagesSquare } from "../_libs/lucide-react.mjs";
import { t as formatDistanceToNow } from "../_libs/date-fns.mjs";
// node_modules/.nitro/vite/services/ssr/assets/chats-Db2i1Vua.js
var import_jsx_runtime = require_jsx_runtime();
function ChatsPage() {
	return useRouterState({ select: (state) => state.location.pathname.replace(/\/+$/, "") === "/chats" }) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatsList, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
function ChatsList() {
	const me = useCurrentUserId();
	const threadsQ = useQuery({
		queryKey: ["chat-threads", me],
		enabled: !!me,
		queryFn: async () => {
			const { data: parts, error } = await database.from("chat_participants").select("thread_id, last_read_at").eq("user_id", me);
			if (error) throw error;
			const threadIds = parts.map((p) => p.thread_id);
			if (threadIds.length === 0) return [];
			const { data: threadRows, error: threadError } = await database.from("chat_threads").select("id, kind, group_id, created_at").in("id", threadIds);
			if (threadError) throw threadError;
			const threadsById = new Map((threadRows ?? []).map((thread) => [thread.id, thread]));
			const groupIds = (threadRows ?? []).map((thread) => thread.group_id).filter((id) => id !== null);
			const { data: groupRows, error: groupsError } = groupIds.length ? await database.from("groups").select("id, name").in("id", groupIds) : {
				data: [],
				error: null
			};
			if (groupsError) throw groupsError;
			const groupsById = new Map((groupRows ?? []).map((group) => [group.id, group]));
			const { data: lastMsgs, error: messagesError } = await database.from("messages").select("thread_id, body, created_at, sender_id").in("thread_id", threadIds).order("created_at", { ascending: false });
			if (messagesError) throw messagesError;
			const lastByThread = /* @__PURE__ */ new Map();
			(lastMsgs ?? []).forEach((m) => {
				if (!lastByThread.has(m.thread_id)) lastByThread.set(m.thread_id, m);
			});
			const { data: others, error: participantsError } = await database.from("chat_participants").select("thread_id, user_id").in("thread_id", threadIds);
			if (participantsError) throw participantsError;
			const counterpart = /* @__PURE__ */ new Map();
			(others ?? []).forEach((p) => {
				if (p.user_id !== me) counterpart.set(p.thread_id, p.user_id);
			});
			return parts.map((p) => {
				const thread = threadsById.get(p.thread_id);
				return {
					threadId: p.thread_id,
					kind: thread?.kind,
					groupName: thread?.group_id ? groupsById.get(thread.group_id)?.name : void 0,
					last: lastByThread.get(p.thread_id),
					otherId: counterpart.get(p.thread_id),
					lastRead: p.last_read_at
				};
			}).sort((a, b) => (b.last?.created_at ?? "").localeCompare(a.last?.created_at ?? ""));
		},
		refetchInterval: 1e4
	});
	const otherIds = (threadsQ.data ?? []).map((t) => t.otherId).filter(Boolean);
	const profs = useProfilesByIds(otherIds);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 pt-6 lg:pt-10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold gradient-text mb-4",
			children: "Chats"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2 pb-6",
			children: [
				threadsQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "glass rounded-3xl h-20 animate-pulse" }),
				threadsQ.data?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "glass rounded-3xl p-8 text-center text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessagesSquare, { className: "size-6 mx-auto mb-2 opacity-60" }), "No chats yet. Reply privately to someone's confession to start a conversation."]
				}),
				threadsQ.data?.map((t) => {
					const p = t.otherId ? profs.data?.get(t.otherId) : null;
					const unread = t.last && t.last.sender_id !== me && t.lastRead && new Date(t.last.created_at) > new Date(t.lastRead);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/chats/$threadId",
						params: { threadId: t.threadId },
						className: "glass rounded-2xl p-3 flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-11 rounded-full gradient-primary-bg flex items-center justify-center text-xs font-bold text-primary-foreground",
								children: t.kind === "group" ? "#" : (p?.anon_number ?? "?").toString().slice(-2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-baseline",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-sm font-semibold truncate",
										children: t.kind === "group" ? t.groupName ?? "Group" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Username, { anonNumber: p?.anon_number })
									}), t.last && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground shrink-0 ml-2",
										children: formatDistanceToNow(new Date(t.last.created_at), { addSuffix: false })
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground truncate",
									children: t.last?.body ?? "No messages yet"
								})]
							}),
							unread && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "size-2 rounded-full bg-primary" })
						]
					}, t.threadId);
				})
			]
		})]
	});
}
export { ChatsPage as component };

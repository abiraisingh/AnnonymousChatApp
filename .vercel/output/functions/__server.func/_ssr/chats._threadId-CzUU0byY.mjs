import { o as __toESM } from "../_runtime.mjs";
import { i as database, r as Route$1 } from "./router-CUD1but5.mjs";
import { t as Username } from "./Username-Bx8lDg2s.mjs";
import { a as useProfilesByIds, r as useCurrentUserId } from "./useProfile-BaSFg7zx.mjs";
import { a as require_jsx_runtime, n as useQuery, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as ArrowLeft, s as Send } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/chats._threadId-CzUU0byY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ChatPage() {
	const { threadId } = Route$1.useParams();
	const me = useCurrentUserId();
	const navigate = useNavigate();
	const [text, setText] = (0, import_react.useState)("");
	const bottomRef = (0, import_react.useRef)(null);
	const threadQ = useQuery({
		queryKey: ["thread-info", threadId],
		queryFn: async () => {
			const { data, error } = await database.from("chat_threads").select("id, kind, group_id").eq("id", threadId).maybeSingle();
			if (error) throw error;
			if (!data) return null;
			if (!data.group_id) return {
				...data,
				groups: null
			};
			const { data: group, error: groupError } = await database.from("groups").select("name").eq("id", data.group_id).maybeSingle();
			if (groupError) throw groupError;
			return {
				...data,
				groups: group
			};
		}
	});
	const partsQ = useQuery({
		queryKey: ["thread-parts", threadId],
		queryFn: async () => {
			const { data } = await database.from("chat_participants").select("user_id").eq("thread_id", threadId);
			return data ?? [];
		}
	});
	const msgsQ = useQuery({
		queryKey: ["messages", threadId],
		queryFn: async () => {
			const { data, error } = await database.from("messages").select("id, sender_id, body, created_at").eq("thread_id", threadId).order("created_at", { ascending: true }).limit(500);
			if (error) throw error;
			return data;
		},
		refetchInterval: 3e3
	});
	const otherId = partsQ.data?.find((p) => p.user_id !== me)?.user_id;
	const profs = useProfilesByIds([.../* @__PURE__ */ new Set([...(msgsQ.data ?? []).map((m) => m.sender_id), ...otherId ? [otherId] : []])]);
	const otherProf = otherId ? profs.data?.get(otherId) : void 0;
	(0, import_react.useEffect)(() => {
		if (me) database.from("chat_participants").update({ last_read_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("thread_id", threadId).eq("user_id", me).then(() => {});
	}, [threadId, me]);
	(0, import_react.useEffect)(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [msgsQ.data?.length]);
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 pt-6 flex flex-col h-[100vh] pb-32 lg:pb-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 mb-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => navigate({ to: "/chats" }),
						className: "size-10 rounded-full glass flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-10 rounded-full gradient-primary-bg flex items-center justify-center text-xs font-bold text-primary-foreground",
						children: threadQ.data?.kind === "group" ? "#" : (otherProf?.anon_number ?? "?").toString().slice(-2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-sm font-bold truncate",
							children: threadQ.data?.kind === "group" ? threadQ.data.groups?.name ?? "Group" : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Username, { anonNumber: otherProf?.anon_number })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground",
							children: "Anonymous · end-to-name-private"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 overflow-y-auto space-y-2 glass-strong rounded-3xl p-3",
				children: [
					msgsQ.data?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-center text-xs text-muted-foreground py-10",
						children: "Say hi — they don't know who you are."
					}),
					msgsQ.data?.map((m) => {
						const mine = m.sender_id === me;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `animate-float-up flex ${mine ? "justify-end" : "justify-start"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `rounded-2xl px-3.5 py-2 text-sm max-w-[80%] ${mine ? "gradient-primary-bg text-primary-foreground" : "glass"}`,
								children: m.body
							})
						}, m.id);
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: bottomRef })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
					placeholder: "Type a message…",
					maxLength: 4e3,
					className: "flex-1 glass-strong rounded-2xl px-3 py-2.5 outline-none border border-border resize-none text-sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: send,
					disabled: !text.trim(),
					className: "size-11 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground disabled:opacity-50 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4" })
				})]
			})
		]
	});
}
export { ChatPage as component };

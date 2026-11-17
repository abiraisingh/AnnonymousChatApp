import { i as database } from "./router-CUD1but5.mjs";
import { t as Username } from "./Username-Bx8lDg2s.mjs";
import { i as useMyProfile, r as useCurrentUserId } from "./useProfile-BaSFg7zx.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { T as BellOff, a as Shield, f as LogOut, r as Trash2, w as Bell } from "../_libs/lucide-react.mjs";
import { n as format } from "../_libs/date-fns.mjs";
// node_modules/.nitro/vite/services/ssr/assets/profile-CylW_VHI.js
var import_jsx_runtime = require_jsx_runtime();
function ProfilePage() {
	const me = useCurrentUserId();
	const navigate = useNavigate();
	const profileQ = useMyProfile();
	const p = profileQ.data;
	const statsQ = useQuery({
		queryKey: ["profile-stats", me],
		enabled: !!me,
		queryFn: async () => {
			const [posts, groups, chats] = await Promise.all([
				database.from("confessions").select("id", {
					count: "exact",
					head: true
				}).eq("author_id", me),
				database.from("group_members").select("group_id", {
					count: "exact",
					head: true
				}).eq("user_id", me),
				database.from("chat_participants").select("thread_id", {
					count: "exact",
					head: true
				}).eq("user_id", me)
			]);
			return {
				posts: posts.count ?? 0,
				groups: groups.count ?? 0,
				chats: chats.count ?? 0
			};
		}
	});
	async function logout() {
		await database.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	}
	async function deleteAccount() {
		if (!confirm("Delete your account permanently? This can't be undone.")) return;
		if (me) await database.from("profiles").delete().eq("id", me);
		await database.auth.signOut();
		toast.success("Account deleted.");
		navigate({
			to: "/auth",
			replace: true
		});
	}
	async function toggleNotifications() {
		if (!me || !p) return;
		const next = !p.notifications_enabled;
		const { error } = await database.from("profiles").update({ notifications_enabled: next }).eq("id", me);
		if (error) toast.error(error.message);
		else {
			profileQ.refetch();
			toast.success(next ? "On" : "Off");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 pt-6 lg:pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "text-center mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "size-20 rounded-full gradient-primary-bg ring-glow flex items-center justify-center text-2xl font-bold text-primary-foreground mx-auto",
						children: (p?.anon_number ?? "?").toString().slice(-2)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-3 text-xl font-bold",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Username, {
							anonNumber: p?.anon_number,
							isGuest: p?.is_guest,
							className: "text-xl"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mt-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "size-3 inline mr-1" }), p?.is_guest ? "Guest account · this browser only" : "Registered account"]
					}),
					p?.created_at && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-[11px] text-muted-foreground mt-1",
						children: ["Joined ", format(new Date(p.created_at), "MMM yyyy")]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-2 mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Posts",
						value: statsQ.data?.posts ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Groups",
						value: statsQ.data?.groups ?? 0
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Chats",
						value: statsQ.data?.chats ?? 0
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: toggleNotifications,
						className: "w-full glass rounded-2xl p-4 flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-3",
							children: [p?.notifications_enabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, { className: "size-4" }), "Notifications"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: p?.notifications_enabled ? "On" : "Off"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: logout,
						className: "w-full glass rounded-2xl p-4 flex items-center gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Log out"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: deleteAccount,
						className: "w-full glass rounded-2xl p-4 flex items-center gap-3 text-sm text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" }), " Delete account"]
					})
				]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "glass rounded-2xl p-4 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-xl font-bold gradient-text",
			children: value
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[11px] text-muted-foreground mt-0.5",
			children: label
		})]
	});
}
export { ProfilePage as component };

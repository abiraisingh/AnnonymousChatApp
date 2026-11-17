import { t as cn } from "./utils-DqMvWTCg.mjs";
import { b as Link, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { h as House, l as Plus, n as User, t as Users, u as MessagesSquare, y as Feather } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/AppShell-Bht9uyYQ.js
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	{
		to: "/feed",
		label: "Home",
		icon: House
	},
	{
		to: "/groups",
		label: "Groups",
		icon: Users
	},
	{
		to: "/chats",
		label: "Chats",
		icon: MessagesSquare
	},
	{
		to: "/profile",
		label: "Profile",
		icon: User
	}
];
function BottomNav() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed bottom-0 inset-x-0 z-40 px-4 pb-[env(safe-area-inset-bottom)] lg:hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-md mb-3 rounded-full border border-glass-border bg-background/70 px-2 py-2 shadow-[var(--shadow-glass)] backdrop-blur-xl flex items-center justify-between relative",
			children: [
				TABS.slice(0, 2).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
					...t,
					active: pathname.startsWith(t.to)
				}, t.to)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/post",
					className: "-mt-8 mx-2 size-14 rounded-full gradient-primary-bg ring-glow flex items-center justify-center text-primary-foreground shadow-lg shrink-0",
					"aria-label": "New confession",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
						className: "size-6",
						strokeWidth: 2.5
					})
				}),
				TABS.slice(2).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
					...t,
					active: pathname.startsWith(t.to)
				}, t.to))
			]
		})
	});
}
function DesktopSidebar() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border/80 bg-background/90 px-5 py-7 backdrop-blur-xl lg:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/feed",
				className: "mb-10 flex items-center gap-3 px-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "flex size-10 items-center justify-center rounded-xl gradient-primary-bg text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feather, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block font-display text-xl font-bold gradient-text",
					children: "Whisper"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs text-muted-foreground",
					children: "Say it without a name"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				"aria-label": "Main navigation",
				className: "space-y-1",
				children: TABS.map((tab) => {
					const active = pathname.startsWith(tab.to);
					const Icon = tab.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: tab.to,
						"aria-current": active ? "page" : void 0,
						className: cn("flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors", active ? "bg-primary/12 text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), tab.label]
					}, tab.to);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/post",
				className: "mt-7 flex items-center justify-center gap-2 rounded-xl gradient-primary-bg px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), "New confession"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-auto px-2 text-xs leading-relaxed text-muted-foreground",
				children: "A quieter corner of the internet. Share honestly, respond kindly."
			})
		]
	});
}
function TabLink({ to, label, icon: Icon, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[11px] transition-colors", active ? "text-foreground" : "text-muted-foreground hover:text-foreground"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: cn("size-5", active && "drop-shadow-[0_0_8px_oklch(0.68_0.22_25/0.7)]") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
	});
}
function AppShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen pb-24 lg:pl-64 lg:pb-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DesktopSidebar, {}),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {})
		]
	});
}
export { AppShell as t };

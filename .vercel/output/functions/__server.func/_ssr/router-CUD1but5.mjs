import { o as __toESM } from "../_runtime.mjs";
import { a as TSS_SERVER_FUNCTION, i as createServerFn, l as __exportAll, o as getServerFnById } from "./server-DQuepINt.mjs";
import { n as groupJoinInput, r as queryInput, t as authInput } from "./postgres.schemas-DD-W6Q9u.mjs";
import { a as require_jsx_runtime, o as require_react, r as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { Ht as redirect, S as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, v as createFileRoute, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
// node_modules/.nitro/vite/services/ssr/assets/router-CUD1but5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-Cv947id2.css";
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass rounded-3xl p-10 text-center max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-6xl font-bold gradient-text",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "This page slipped away."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "mt-6 inline-flex items-center justify-center rounded-full gradient-primary-bg px-5 py-2.5 text-sm font-semibold text-primary-foreground",
					children: "Back to feed"
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center px-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "glass rounded-3xl p-8 text-center max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold",
					children: "Something broke"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Try again, or head home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "rounded-full gradient-primary-bg px-4 py-2 text-sm font-semibold text-primary-foreground",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "rounded-full glass px-4 py-2 text-sm",
						children: "Home"
					})]
				})
			]
		})
	});
}
var Route$12 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{
				name: "theme-color",
				content: "#111112"
			},
			{ title: "Whisper — Anonymous Confessions" },
			{
				name: "description",
				content: "Share confessions anonymously, join communities, and message privately. No real names, ever."
			},
			{
				property: "og:title",
				content: "Whisper — Anonymous Confessions"
			},
			{
				property: "og:description",
				content: "Share confessions anonymously, join communities, and message privately. No real names, ever."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "twitter:title",
				content: "Whisper — Anonymous Confessions"
			},
			{
				name: "twitter:description",
				content: "Share confessions anonymously, join communities, and message privately. No real names, ever."
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$12.useRouteContext();
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setReady(true);
	}, []);
	if (!ready) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
			theme: "dark",
			position: "top-center"
		})]
	});
}
var Route$11 = createFileRoute("/")({ beforeLoad: () => {
	throw redirect({ to: "/feed" });
} });
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var authRequest = createServerFn({ method: "POST" }).validator((data) => authInput.parse(data)).handler(createSsrRpc("283aa34e80053e4dcef760b5f3ca9134a725d8de2c0392c03e56d6587360cbb8"));
var databaseRequest = createServerFn({ method: "POST" }).validator((data) => queryInput.parse(data)).handler(createSsrRpc("4349f00da76b4568b4dc9995e80a69f052201b63218ef1679d2dcf6a1065e49a"));
var joinGroupRequest = createServerFn({ method: "POST" }).validator((data) => groupJoinInput.parse(data)).handler(createSsrRpc("fcc172804fde88f5d4c5a843ad642ca01485b1c7393be1a3d939e5e609255f59"));
var QueryBuilder = class {
	table;
	action = "select";
	selection = "*";
	filters = [];
	orderBy;
	rowLimit;
	values;
	singleMode;
	count = false;
	head = false;
	pending;
	constructor(table) {
		this.table = table;
	}
	select(columns = "*", options) {
		this.selection = columns;
		this.count = options?.count === "exact";
		this.head = options?.head ?? false;
		return this;
	}
	insert(values) {
		this.action = "insert";
		this.values = values;
		return this;
	}
	update(values) {
		this.action = "update";
		this.values = values;
		return this;
	}
	delete() {
		this.action = "delete";
		return this;
	}
	eq(column, value) {
		this.filters.push({
			column,
			operator: "eq",
			value
		});
		return this;
	}
	neq(column, value) {
		this.filters.push({
			column,
			operator: "neq",
			value
		});
		return this;
	}
	is(column, value) {
		this.filters.push({
			column,
			operator: "is",
			value
		});
		return this;
	}
	ilike(column, value) {
		this.filters.push({
			column,
			operator: "ilike",
			value
		});
		return this;
	}
	in(column, value) {
		this.filters.push({
			column,
			operator: "in",
			value
		});
		return this;
	}
	order(column, options) {
		this.orderBy = {
			column,
			ascending: options?.ascending
		};
		return this;
	}
	limit(count) {
		this.rowLimit = count;
		return this;
	}
	single() {
		this.singleMode = "single";
		return this.execute();
	}
	maybeSingle() {
		this.singleMode = "maybeSingle";
		return this.execute();
	}
	execute() {
		if (!this.pending) this.pending = databaseRequest({ data: {
			table: this.table,
			action: this.action,
			select: this.selection,
			filters: this.filters,
			order: this.orderBy,
			limit: this.rowLimit,
			values: this.values,
			single: this.singleMode,
			count: this.count,
			head: this.head
		} });
		return this.pending;
	}
	then(onfulfilled, onrejected) {
		return this.execute().then(onfulfilled ?? void 0, onrejected ?? void 0);
	}
};
var database = {
	from(table) {
		return new QueryBuilder(table);
	},
	auth: {
		async getUser() {
			const result = await authRequest({ data: { action: "current" } });
			return {
				data: { user: "user" in result ? result.user : null },
				error: null
			};
		},
		async signUp({ email, password }) {
			const result = await authRequest({ data: {
				action: "signup",
				email,
				password
			} });
			if (!("user" in result)) return {
				data: {
					user: null,
					session: null
				},
				error: result.error
			};
			return {
				data: {
					user: result.user,
					session: {}
				},
				error: null
			};
		},
		async signInWithPassword({ email, password }) {
			const result = await authRequest({ data: {
				action: "signin",
				email,
				password
			} });
			if (!("user" in result)) return {
				data: {
					user: null,
					session: null
				},
				error: result.error
			};
			return {
				data: {
					user: result.user,
					session: {}
				},
				error: null
			};
		},
		async signInAnonymously() {
			const result = await authRequest({ data: { action: "guest" } });
			if (!("user" in result)) return {
				data: { user: null },
				error: result.error
			};
			return {
				data: { user: result.user },
				error: null
			};
		},
		async signOut() {
			const result = await authRequest({ data: { action: "logout" } });
			if (!("user" in result)) return { error: result.error };
			return { error: null };
		},
		onAuthStateChange() {
			return { data: { subscription: { unsubscribe() {} } } };
		}
	}
};
var $$splitComponentImporter$10 = () => import("./route-BWBOrQop.mjs");
var Route$10 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await database.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./route-S85LmbEN.mjs");
var Route$9 = createFileRoute("/_public")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./auth-CyXTusj8.mjs");
var Route$8 = createFileRoute("/auth")({
	head: () => ({ meta: [{ title: "Sign in — Whisper" }, {
		name: "description",
		content: "Sign in or continue anonymously to start sharing."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./chats-Db2i1Vua.mjs");
var Route$7 = createFileRoute("/_authenticated/chats")({
	head: () => ({ meta: [{ title: "Chats — Whisper" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./groups-BXMWxbBH.mjs");
var Route$6 = createFileRoute("/_authenticated/groups")({
	head: () => ({ meta: [{ title: "Groups — Whisper" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./post-CCUQKFVy.mjs");
var Route$5 = createFileRoute("/_authenticated/post")({
	head: () => ({ meta: [{ title: "New confession — Whisper" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./profile-CylW_VHI.mjs");
var Route$4 = createFileRoute("/_authenticated/profile")({
	head: () => ({ meta: [{ title: "Profile — Whisper" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./search-eO99svNL.mjs");
var Route$3 = createFileRoute("/_authenticated/search")({
	head: () => ({ meta: [{ title: "Search — Whisper" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./feed-DQayPBUV.mjs");
var Route$2 = createFileRoute("/_public/feed")({
	head: () => ({ meta: [{ title: "Feed — Whisper" }, {
		name: "description",
		content: "Latest anonymous confessions."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./chats._threadId-CzUU0byY.mjs");
var Route$1 = createFileRoute("/_authenticated/chats/$threadId")({
	head: () => ({ meta: [{ title: "Chat — Whisper" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./groups._groupId-BSfT4Lsx.mjs");
var Route = createFileRoute("/_authenticated/groups/$groupId")({
	head: () => ({ meta: [{ title: "Group — Whisper" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var IndexRoute = Route$11.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$12
});
var AuthenticatedRouteRoute = Route$10.update({
	id: "/_authenticated",
	getParentRoute: () => Route$12
});
var PublicRouteRoute = Route$9.update({
	id: "/_public",
	getParentRoute: () => Route$12
});
var AuthRoute = Route$8.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$12
});
var AuthenticatedChatsRoute = Route$7.update({
	id: "/chats",
	path: "/chats",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedGroupsRoute = Route$6.update({
	id: "/groups",
	path: "/groups",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedPostRoute = Route$5.update({
	id: "/post",
	path: "/post",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedProfileRoute = Route$4.update({
	id: "/profile",
	path: "/profile",
	getParentRoute: () => AuthenticatedRouteRoute
});
var AuthenticatedSearchRoute = Route$3.update({
	id: "/search",
	path: "/search",
	getParentRoute: () => AuthenticatedRouteRoute
});
var PublicFeedRoute = Route$2.update({
	id: "/feed",
	path: "/feed",
	getParentRoute: () => PublicRouteRoute
});
var AuthenticatedChatsThreadIdRoute = Route$1.update({
	id: "/$threadId",
	path: "/$threadId",
	getParentRoute: () => AuthenticatedChatsRoute
});
var AuthenticatedGroupsGroupIdRoute = Route.update({
	id: "/$groupId",
	path: "/$groupId",
	getParentRoute: () => AuthenticatedGroupsRoute
});
var AuthenticatedChatsRouteChildren = { AuthenticatedChatsThreadIdRoute };
var AuthenticatedChatsRouteWithChildren = AuthenticatedChatsRoute._addFileChildren(AuthenticatedChatsRouteChildren);
var AuthenticatedGroupsRouteChildren = { AuthenticatedGroupsGroupIdRoute };
var AuthenticatedRouteRouteChildren = {
	AuthenticatedChatsRoute: AuthenticatedChatsRouteWithChildren,
	AuthenticatedGroupsRoute: AuthenticatedGroupsRoute._addFileChildren(AuthenticatedGroupsRouteChildren),
	AuthenticatedPostRoute,
	AuthenticatedProfileRoute,
	AuthenticatedSearchRoute
};
var AuthenticatedRouteRouteWithChildren = AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren);
var PublicRouteRouteChildren = { PublicFeedRoute };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRouteWithChildren,
	PublicRouteRoute: PublicRouteRoute._addFileChildren(PublicRouteRouteChildren),
	AuthRoute
};
var routeTree = Route$12._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
export { joinGroupRequest as a, database as i, Route as n, createSsrRpc as o, Route$1 as r, router_exports as t };

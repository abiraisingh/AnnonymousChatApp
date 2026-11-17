import { o as __toESM } from "../_runtime.mjs";
import { a as joinGroupRequest, i as database } from "./router-CUD1but5.mjs";
import { r as useCurrentUserId } from "./useProfile-BaSFg7zx.mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, o as require_react, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { b as Link, g as Outlet, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { l as Plus, m as KeyRound, p as Lock, t as Users } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/groups-BXMWxbBH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GroupsPage() {
	return useRouterState({ select: (state) => state.location.pathname.replace(/\/+$/, "") === "/groups" }) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GroupsList, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {});
}
function GroupsList() {
	const me = useCurrentUserId();
	const qc = useQueryClient();
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [joinCode, setJoinCode] = (0, import_react.useState)("");
	const groupsQ = useQuery({
		queryKey: ["groups-list", me],
		queryFn: async () => {
			const { data, error } = await database.from("groups").select("id, name, slug, description, category, is_private, icon_url, creator_id").order("created_at", { ascending: false }).limit(50);
			if (error) throw error;
			return data;
		}
	});
	const myMembershipQ = useQuery({
		queryKey: ["my-memberships", me],
		enabled: !!me,
		queryFn: async () => {
			const { data, error } = await database.from("group_members").select("group_id").eq("user_id", me);
			if (error) throw error;
			return new Set(data.map((r) => r.group_id));
		}
	});
	const joinByCode = useMutation({
		mutationFn: async (code) => {
			if (!me) throw new Error("Sign in");
			const { id } = await joinGroupRequest({ data: { inviteCode: code.trim().toUpperCase() } });
			return id;
		},
		onSuccess: (id) => {
			qc.invalidateQueries({ queryKey: ["my-memberships"] });
			qc.invalidateQueries({ queryKey: ["groups-list"] });
			toast.success("Joined.");
			setJoinCode("");
			window.location.href = `/groups/${id}`;
		},
		onError: (e) => toast.error(e.message)
	});
	const joinPublic = useMutation({
		mutationFn: async (groupId) => {
			if (!me) return;
			await joinGroupRequest({ data: { groupId } });
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["my-memberships"] });
			toast.success("Joined.");
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-5xl px-4 pt-6 lg:pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between mb-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold gradient-text",
					children: "Groups"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setCreating(true),
					className: "size-10 rounded-full gradient-primary-bg flex items-center justify-center text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass rounded-2xl p-3 flex gap-2 mb-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4 self-center text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: joinCode,
						onChange: (e) => setJoinCode(e.target.value),
						placeholder: "Enter invite code",
						className: "flex-1 bg-transparent outline-none text-sm"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: !joinCode.trim(),
						onClick: () => joinByCode.mutate(joinCode),
						className: "text-xs px-3 py-1.5 rounded-full gradient-primary-bg text-primary-foreground disabled:opacity-50",
						children: "Join"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3 pb-6",
				children: [
					groupsQ.isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "glass rounded-3xl h-32 animate-pulse" }),
					groupsQ.data?.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "glass rounded-3xl p-6 text-center text-sm text-muted-foreground",
						children: "No groups yet. Create the first one."
					}),
					groupsQ.data?.map((g, i) => {
						const joined = myMembershipQ.data?.has(g.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							style: { animationDelay: `${i * .03}s` },
							className: "glass animate-float-up rounded-3xl p-4 flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "size-12 rounded-2xl gradient-primary-bg flex items-center justify-center text-primary-foreground font-bold",
									children: g.name.charAt(0).toUpperCase()
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-semibold truncate",
											children: g.name
										}), g.is_private && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3 text-muted-foreground" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted-foreground truncate",
										children: [g.category ?? "Community", g.description ? ` · ${g.description}` : ""]
									})]
								}),
								joined ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/groups/$groupId",
									params: { groupId: g.id },
									className: "text-xs px-3 py-1.5 rounded-full glass",
									children: "Open"
								}) : g.is_private ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs px-3 py-1.5 rounded-full glass text-muted-foreground",
									children: "Private"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => joinPublic.mutate(g.id),
									className: "text-xs px-3 py-1.5 rounded-full gradient-primary-bg text-primary-foreground font-semibold",
									children: "Join"
								})
							]
						}, g.id);
					})
				]
			}),
			creating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreateGroupModal, {
				onClose: () => setCreating(false),
				onCreated: () => {
					setCreating(false);
					qc.invalidateQueries({ queryKey: ["groups-list"] });
				}
			})
		]
	});
}
function CreateGroupModal({ onClose, onCreated }) {
	const me = useCurrentUserId();
	const [name, setName] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("");
	const [isPrivate, setIsPrivate] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function create() {
		if (!me || !name.trim()) return;
		setLoading(true);
		try {
			const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) + "-" + Math.random().toString(36).slice(2, 6);
			const inviteCode = isPrivate ? Math.random().toString(36).slice(2, 10).toUpperCase() : null;
			const { data, error } = await database.from("groups").insert({
				name: name.trim(),
				slug,
				description: description.trim() || null,
				category: category.trim() || null,
				is_private: isPrivate,
				invite_code: inviteCode,
				creator_id: me
			}).select("id").single();
			if (error) throw error;
			toast.success(inviteCode ? `Group created. Invite code: ${inviteCode}` : "Group created.");
			onCreated();
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't create group.");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "glass-strong animate-float-up rounded-3xl p-6 w-full max-w-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-lg font-bold mb-4 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4" }), " Create group"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Group name",
							value: name,
							onChange: (e) => setName(e.target.value),
							className: "w-full rounded-2xl bg-input/60 px-4 py-3 outline-none border border-border focus:border-primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							placeholder: "Category (e.g. Developers)",
							value: category,
							onChange: (e) => setCategory(e.target.value),
							className: "w-full rounded-2xl bg-input/60 px-4 py-3 outline-none border border-border focus:border-primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							placeholder: "Description",
							value: description,
							onChange: (e) => setDescription(e.target.value),
							rows: 3,
							className: "w-full rounded-2xl bg-input/60 px-4 py-3 outline-none border border-border focus:border-primary resize-none"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center justify-between glass rounded-2xl p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }), " Private (invite-only)"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: isPrivate,
								onChange: (e) => setIsPrivate(e.target.checked)
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "flex-1 rounded-2xl glass py-3 text-sm",
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: create,
						disabled: loading || !name.trim(),
						className: "flex-1 rounded-2xl gradient-primary-bg py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50",
						children: loading ? "Creating…" : "Create"
					})]
				})
			]
		})
	});
}
export { GroupsPage as component };

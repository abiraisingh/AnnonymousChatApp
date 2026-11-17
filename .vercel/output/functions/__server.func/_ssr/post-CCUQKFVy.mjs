import { o as __toESM } from "../_runtime.mjs";
import { i as database } from "./router-CUD1but5.mjs";
import { n as MOODS, t as CATEGORIES } from "./categories-kVw_BVXO.mjs";
import { r as useCurrentUserId } from "./useProfile-BaSFg7zx.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { E as ArrowLeft } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/post-CCUQKFVy.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PostPage() {
	const navigate = useNavigate();
	const me = useCurrentUserId();
	const [body, setBody] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("Random");
	const [mood, setMood] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function submit() {
		if (!me) return;
		if (body.trim().length < 3) {
			toast.error("Say a bit more.");
			return;
		}
		setLoading(true);
		try {
			const { error } = await database.from("confessions").insert({
				author_id: me,
				body: body.trim(),
				category,
				mood,
				group_id: null
			});
			if (error) throw error;
			toast.success("Confession shared anonymously.");
			navigate({ to: "/feed" });
		} catch (e) {
			toast.error(e instanceof Error ? e.message : "Couldn't post");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-3xl px-4 pt-6 lg:pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center gap-3 mb-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => navigate({ to: "/feed" }),
					className: "size-10 rounded-full glass flex items-center justify-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-bold",
					children: "New confession"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-strong animate-float-up rounded-3xl p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					value: body,
					onChange: (e) => setBody(e.target.value),
					maxLength: 2e3,
					rows: 7,
					autoFocus: true,
					placeholder: "What do you want to confess? It stays anonymous.",
					className: "w-full bg-transparent outline-none resize-none placeholder:text-muted-foreground"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-between text-[11px] text-muted-foreground mt-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Share thoughtfully. Posts can be reported by the community." }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [body.length, "/2000"] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs uppercase tracking-wider text-muted-foreground mb-2",
					children: "Category"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setCategory(c),
						className: `text-xs px-3 py-1.5 rounded-full border transition ${category === c ? "gradient-primary-bg text-primary-foreground border-transparent font-semibold" : "glass text-muted-foreground border-border"}`,
						children: c
					}, c))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xs uppercase tracking-wider text-muted-foreground mb-2",
					children: "Mood (optional)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMood(null),
						className: `text-xs px-3 py-1.5 rounded-full border ${mood === null ? "bg-primary/20 border-primary/60" : "glass border-border"}`,
						children: "None"
					}), MOODS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMood(m),
						className: `text-lg size-10 rounded-full border ${mood === m ? "bg-primary/20 border-primary/60" : "glass border-border"}`,
						children: m
					}, m))]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: submit,
				disabled: loading || body.trim().length < 3,
				className: "mt-6 w-full rounded-2xl gradient-primary-bg py-3 font-semibold text-primary-foreground disabled:opacity-50",
				children: loading ? "Posting…" : "Post anonymously"
			})
		]
	});
}
export { PostPage as component };

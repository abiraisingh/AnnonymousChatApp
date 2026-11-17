import { o as __toESM } from "../_runtime.mjs";
import { i as database } from "./router-CUD1but5.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { b as Eye, i as Sparkles, x as EyeOff } from "../_libs/lucide-react.mjs";
// node_modules/.nitro/vite/services/ssr/assets/auth-CyXTusj8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("signup");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPw, setShowPw] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setHydrated(true);
		database.auth.getUser().then(({ data }) => {
			if (data.user) navigate({
				to: "/feed",
				replace: true
			});
		});
	}, [navigate]);
	if (!hydrated) return null;
	async function handleEmail(e) {
		e.preventDefault();
		setLoading(true);
		try {
			const normalizedEmail = email.trim();
			const { data, error } = mode === "signup" ? await database.auth.signUp({
				email: normalizedEmail,
				password
			}) : await database.auth.signInWithPassword({
				email: normalizedEmail,
				password
			});
			if (error) throw error;
			toast.success(mode === "signup" ? "Welcome — you're in." : "Welcome back.");
			navigate({
				to: "/feed",
				replace: true
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Auth failed");
		} finally {
			setLoading(false);
		}
	}
	async function handleGuest() {
		setLoading(true);
		try {
			const { error } = await database.auth.signInAnonymously();
			if (error) throw error;
			toast.success("You're in as a guest.");
			navigate({
				to: "/feed",
				replace: true
			});
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Couldn't start guest session");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-screen flex flex-col items-center justify-center px-6 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "text-center mb-8 animate-float-up",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), " Your identity stays private"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-4xl font-bold gradient-text",
						children: "Whisper"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Share confessions and connect under a username. Your email stays private."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "glass-strong rounded-3xl p-6 animate-float-up",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex p-1 rounded-full bg-muted/40 mb-5 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: loading,
							"aria-pressed": mode === "signup",
							onClick: () => setMode("signup"),
							className: `flex-1 py-2 rounded-full transition ${mode === "signup" ? "gradient-primary-bg text-primary-foreground font-semibold" : "text-muted-foreground"}`,
							children: "Create account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: loading,
							"aria-pressed": mode === "signin",
							onClick: () => setMode("signin"),
							className: `flex-1 py-2 rounded-full transition ${mode === "signin" ? "gradient-primary-bg text-primary-foreground font-semibold" : "text-muted-foreground"}`,
							children: "Sign in"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleEmail,
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								htmlFor: "email",
								className: "sr-only",
								children: "Email"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "email",
								name: "email",
								type: "email",
								autoComplete: "email",
								required: true,
								disabled: loading,
								value: email,
								onChange: (e) => setEmail(e.target.value),
								placeholder: "Email",
								className: "w-full rounded-2xl bg-input/60 px-4 py-3 outline-none border border-border focus:border-primary"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "password",
										className: "sr-only",
										children: "Password"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "password",
										name: "password",
										type: showPw ? "text" : "password",
										autoComplete: mode === "signup" ? "new-password" : "current-password",
										required: true,
										minLength: 10,
										disabled: loading,
										value: password,
										onChange: (e) => setPassword(e.target.value),
										placeholder: "Password (10+ chars)",
										className: "w-full rounded-2xl bg-input/60 px-4 py-3 pr-12 outline-none border border-border focus:border-primary"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: loading,
										"aria-label": showPw ? "Hide password" : "Show password",
										onClick: () => setShowPw((v) => !v),
										className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
										children: showPw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: loading,
								type: "submit",
								className: "w-full rounded-2xl gradient-primary-bg text-primary-foreground py-3 font-semibold disabled:opacity-60",
								children: loading ? "Please wait…" : mode === "signup" ? "Create anonymous account" : "Sign in"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "my-5 flex items-center gap-3 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" }),
							" or ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "flex-1 h-px bg-border" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleGuest,
						disabled: loading,
						className: "w-full rounded-2xl glass py-3 font-medium hover:bg-accent/50 transition",
						children: "Continue as Guest"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-[11px] text-center text-muted-foreground",
						children: "Guest accounts can't be recovered if you sign out or clear data."
					})
				]
			})]
		})
	});
}
export { AuthPage as component };

import { t as cn } from "./utils-DqMvWTCg.mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
// node_modules/.nitro/vite/services/ssr/assets/Username-Bx8lDg2s.js
var import_jsx_runtime = require_jsx_runtime();
function anonName(n) {
	return `User${n ?? "?"}`;
}
function Username({ anonNumber, className, isGuest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("font-display font-semibold gradient-text", className),
		children: [anonName(anonNumber), isGuest ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "ml-1 text-[10px] uppercase tracking-wider text-muted-foreground",
			children: "guest"
		}) : null]
	});
}
export { Username as t };

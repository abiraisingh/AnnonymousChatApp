import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
// node_modules/.nitro/vite/services/ssr/assets/utils-DqMvWTCg.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
export { cn as t };

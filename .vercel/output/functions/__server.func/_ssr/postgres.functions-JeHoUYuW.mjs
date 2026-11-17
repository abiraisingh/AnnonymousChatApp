import { t as createServerRpc } from "./createServerRpc-kXdTWBFh.mjs";
import { i as createServerFn } from "./server-DQuepINt.mjs";
import { n as groupJoinInput, r as queryInput, t as authInput } from "./postgres.schemas-DD-W6Q9u.mjs";
// node_modules/.nitro/vite/services/ssr/assets/postgres.functions-JeHoUYuW.js
var authRequest_createServerFn_handler = createServerRpc({
	id: "283aa34e80053e4dcef760b5f3ca9134a725d8de2c0392c03e56d6587360cbb8",
	name: "authRequest",
	filename: "frontend/src/lib/postgres.functions.ts"
}, (opts) => authRequest.__executeServer(opts));
var authRequest = createServerFn({ method: "POST" }).validator((data) => authInput.parse(data)).handler(authRequest_createServerFn_handler, async ({ data }) => {
	const { runAuthRequest } = await import("./postgres.server-Dhmtw4Ls.mjs");
	return runAuthRequest(data);
});
var databaseRequest_createServerFn_handler = createServerRpc({
	id: "4349f00da76b4568b4dc9995e80a69f052201b63218ef1679d2dcf6a1065e49a",
	name: "databaseRequest",
	filename: "frontend/src/lib/postgres.functions.ts"
}, (opts) => databaseRequest.__executeServer(opts));
var databaseRequest = createServerFn({ method: "POST" }).validator((data) => queryInput.parse(data)).handler(databaseRequest_createServerFn_handler, async ({ data }) => {
	const { runDatabaseRequest } = await import("./postgres.server-Dhmtw4Ls.mjs");
	return runDatabaseRequest(data);
});
var joinGroupRequest_createServerFn_handler = createServerRpc({
	id: "fcc172804fde88f5d4c5a843ad642ca01485b1c7393be1a3d939e5e609255f59",
	name: "joinGroupRequest",
	filename: "frontend/src/lib/postgres.functions.ts"
}, (opts) => joinGroupRequest.__executeServer(opts));
var joinGroupRequest = createServerFn({ method: "POST" }).validator((data) => groupJoinInput.parse(data)).handler(joinGroupRequest_createServerFn_handler, async ({ data }) => {
	const { runJoinGroupRequest } = await import("./postgres.server-Dhmtw4Ls.mjs");
	return runJoinGroupRequest(data);
});
export { authRequest_createServerFn_handler, databaseRequest_createServerFn_handler, joinGroupRequest_createServerFn_handler };

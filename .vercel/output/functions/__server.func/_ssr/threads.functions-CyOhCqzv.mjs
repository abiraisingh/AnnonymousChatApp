import { t as createServerRpc } from "./createServerRpc-kXdTWBFh.mjs";
import { l as string, s as object } from "../_libs/zod.mjs";
import { i as createServerFn } from "./server-DQuepINt.mjs";
// node_modules/.nitro/vite/services/ssr/assets/threads.functions-CyOhCqzv.js
var Input = object({ confessionId: string().uuid() });
var openPrivateReplyThread_createServerFn_handler = createServerRpc({
	id: "5eefe3d4fe2db05c404e2d362eaa48d27c9c30f3f50ceb6dcfb6da6677bfc587",
	name: "openPrivateReplyThread",
	filename: "frontend/src/lib/threads.functions.ts"
}, (opts) => openPrivateReplyThread.__executeServer(opts));
var openPrivateReplyThread = createServerFn({ method: "POST" }).validator((data) => Input.parse(data)).handler(openPrivateReplyThread_createServerFn_handler, async ({ data }) => {
	const [{ currentUserId }, { pool }] = await Promise.all([import("./postgres.server-Dhmtw4Ls.mjs"), import("./database.server-SdWEVRNK.mjs")]);
	const userId = await currentUserId();
	if (!userId) throw new Error("Sign in required.");
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const confession = await client.query(`SELECT c.author_id FROM confessions c
         WHERE c.id = $1 AND (c.group_id IS NULL OR EXISTS (
           SELECT 1 FROM group_members gm WHERE gm.group_id = c.group_id AND gm.user_id = $2
         ))`, [data.confessionId, userId]);
		if (!confession.rowCount) throw new Error("Confession not found.");
		const authorId = confession.rows[0].author_id;
		if (authorId === userId) throw new Error("You can't privately reply to yourself.");
		const pair = [userId, authorId].sort();
		await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [pair.join(":")]);
		const existing = await client.query(`SELECT cp1.thread_id
         FROM chat_participants cp1
         JOIN chat_participants cp2 ON cp2.thread_id = cp1.thread_id
         JOIN chat_threads t ON t.id = cp1.thread_id
         WHERE cp1.user_id = $1 AND cp2.user_id = $2 AND t.kind = 'direct'
         LIMIT 1`, [userId, authorId]);
		if (existing.rowCount) {
			await client.query("COMMIT");
			return { threadId: existing.rows[0].thread_id };
		}
		const threadId = (await client.query("INSERT INTO chat_threads(kind, confession_id) VALUES('direct', $1) RETURNING id", [data.confessionId])).rows[0].id;
		await client.query("INSERT INTO chat_participants(thread_id, user_id) VALUES($1, $2), ($1, $3)", [
			threadId,
			userId,
			authorId
		]);
		await client.query("INSERT INTO notifications(user_id, kind, payload) VALUES($1, 'private_reply', $2::jsonb)", [authorId, JSON.stringify({
			thread_id: threadId,
			confession_id: data.confessionId
		})]);
		await client.query("COMMIT");
		return { threadId };
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
});
export { openPrivateReplyThread_createServerFn_handler };

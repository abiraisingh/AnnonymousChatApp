import { c as setResponseHeader, s as getRequest } from "./server-DQuepINt.mjs";
import { pool } from "./database.server-SdWEVRNK.mjs";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
// node_modules/.nitro/vite/services/ssr/assets/postgres.server-Dhmtw4Ls.js
var scrypt$1 = promisify(scrypt);
var SESSION_COOKIE = "__Host-whisper_session";
var SESSION_DAYS = 30;
var columns = {
	bookmarks: [
		"user_id",
		"confession_id",
		"created_at"
	],
	chat_participants: [
		"thread_id",
		"user_id",
		"last_read_at"
	],
	chat_threads: [
		"id",
		"kind",
		"group_id",
		"confession_id",
		"created_at"
	],
	confessions: [
		"id",
		"author_id",
		"group_id",
		"category",
		"mood",
		"body",
		"created_at"
	],
	group_comments: [
		"id",
		"confession_id",
		"author_id",
		"parent_id",
		"body",
		"created_at"
	],
	group_members: [
		"group_id",
		"user_id",
		"role",
		"joined_at"
	],
	groups: [
		"id",
		"name",
		"slug",
		"description",
		"category",
		"is_private",
		"invite_code",
		"icon_url",
		"creator_id",
		"created_at"
	],
	messages: [
		"id",
		"thread_id",
		"sender_id",
		"body",
		"created_at"
	],
	notifications: [
		"id",
		"user_id",
		"kind",
		"payload",
		"read_at",
		"created_at"
	],
	profiles: [
		"id",
		"anon_number",
		"is_guest",
		"notifications_enabled",
		"created_at"
	],
	reactions: [
		"id",
		"confession_id",
		"user_id",
		"kind",
		"created_at"
	],
	reports: [
		"id",
		"reporter_id",
		"target_type",
		"target_id",
		"reason",
		"status",
		"created_at"
	]
};
function dbError(error) {
	const code = typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;
	const message = code === "23505" ? "That item already exists." : code ? "The database request could not be completed." : error instanceof Error ? error.message : "Database request failed.";
	console.error("Database request failed", {
		code,
		message
	});
	return {
		data: null,
		error: { message },
		count: null
	};
}
function cookieValue(request, name) {
	const entry = (request.headers.get("cookie") ?? "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
	if (!entry) return null;
	try {
		return decodeURIComponent(entry.slice(name.length + 1));
	} catch {
		return null;
	}
}
function setSessionCookie(token) {
	const secure = "; Secure";
	const value = token ? `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure}` : `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
	setResponseHeader("Set-Cookie", value);
}
function tokenHash(token) {
	return createHash("sha256").update(token).digest("hex");
}
async function currentUserId() {
	const request = getRequest();
	const token = request ? cookieValue(request, SESSION_COOKIE) : null;
	if (!token || token.length > 200) return null;
	return (await pool.query("SELECT user_id FROM sessions WHERE token_hash = $1 AND expires_at > now()", [tokenHash(token)])).rows[0]?.user_id ?? null;
}
async function createSession(userId) {
	const token = randomBytes(32).toString("base64url");
	await pool.query("INSERT INTO sessions(token_hash, user_id, expires_at) VALUES($1, $2, now() + interval '30 days')", [tokenHash(token), userId]);
	setSessionCookie(token);
}
async function assertLoginLimit(email) {
	const hash = tokenHash(email);
	const limit = (await pool.query("SELECT attempts, window_started_at FROM auth_login_limits WHERE email_hash = $1", [hash])).rows[0];
	if (limit && limit.attempts >= 10 && Date.now() - new Date(limit.window_started_at).getTime() < 9e5) throw new Error("Too many sign-in attempts. Try again in 15 minutes.");
}
async function recordLoginFailure(email) {
	await pool.query(`INSERT INTO auth_login_limits(email_hash, attempts, window_started_at)
     VALUES($1, 1, now())
     ON CONFLICT(email_hash) DO UPDATE SET
       attempts = CASE WHEN auth_login_limits.window_started_at < now() - interval '15 minutes'
         THEN 1 ELSE auth_login_limits.attempts + 1 END,
       window_started_at = CASE WHEN auth_login_limits.window_started_at < now() - interval '15 minutes'
         THEN now() ELSE auth_login_limits.window_started_at END`, [tokenHash(email)]);
}
async function hashPassword(password, salt = randomBytes(16).toString("hex")) {
	return `${salt}:${(await scrypt$1(password, salt, 64)).toString("hex")}`;
}
async function verifyPassword(password, stored) {
	const [salt, key] = stored.split(":");
	if (!salt || !key) return false;
	const expected = Buffer.from(key, "hex");
	const actual = await scrypt$1(password, salt, expected.length);
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}
async function runAuthRequest(data) {
	try {
		if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
		if (data.action === "current") {
			const id = await currentUserId();
			return { user: id ? { id } : null };
		}
		if (data.action === "logout") {
			const request = getRequest();
			const token = request ? cookieValue(request, SESSION_COOKIE) : null;
			if (token) await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash(token)]);
			setSessionCookie(null);
			return { user: null };
		}
		if (data.action === "guest") {
			const client = await pool.connect();
			try {
				await client.query("BEGIN");
				const user = await client.query("INSERT INTO users(is_guest) VALUES(true) RETURNING id");
				await client.query("COMMIT");
				await createSession(user.rows[0].id);
				return { user: { id: user.rows[0].id } };
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			} finally {
				client.release();
			}
		}
		if (data.action === "signup") {
			const email = data.email.trim().toLowerCase();
			const client = await pool.connect();
			try {
				await client.query("BEGIN");
				const user = await client.query("INSERT INTO users(email, password_hash) VALUES($1, $2) RETURNING id", [email, await hashPassword(data.password)]);
				await client.query("COMMIT");
				await createSession(user.rows[0].id);
				return { user: { id: user.rows[0].id } };
			} catch (error) {
				await client.query("ROLLBACK");
				if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") throw new Error("An account with this email already exists.");
				throw error;
			} finally {
				client.release();
			}
		}
		const email = data.email.trim().toLowerCase();
		await assertLoginLimit(email);
		const account = (await pool.query("SELECT id, password_hash FROM users WHERE email = $1 AND is_guest = false", [email])).rows[0];
		if (!account || !await verifyPassword(data.password, account.password_hash)) {
			await recordLoginFailure(email);
			throw new Error("Invalid email or password.");
		}
		await pool.query("DELETE FROM auth_login_limits WHERE email_hash = $1", [tokenHash(email)]);
		await createSession(account.id);
		return { user: { id: account.id } };
	} catch (error) {
		return dbError(error);
	}
}
function assertColumn(table, name) {
	if (!columns[table].includes(name)) throw new Error(`Unsupported column ${name} for ${table}.`);
}
async function isGroupMember(userId, groupId) {
	return (await pool.query("SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2", [groupId, userId])).rowCount !== 0;
}
async function authorizeSelect(userId, table, filters) {
	if (!userId) {
		if (![
			"confessions",
			"profiles",
			"reactions"
		].includes(table)) throw new Error("Unauthorized.");
		return;
	}
	const value = (column) => filters.find((filter) => filter.column === column && filter.operator === "eq")?.value;
	if (table === "profiles" || table === "groups" || table === "confessions" || table === "reactions") return;
	if (table === "bookmarks" || table === "notifications") {
		if (value("user_id") !== userId) throw new Error("Forbidden.");
		return;
	}
	if (table === "reports") {
		if (value("reporter_id") !== userId) throw new Error("Forbidden.");
		return;
	}
	if (table === "group_members") {
		const groupId = value("group_id");
		if (value("user_id") === userId || typeof groupId === "string" && await isGroupMember(userId, groupId)) return;
		throw new Error("Forbidden.");
	}
	if (table === "chat_participants" && value("user_id") === userId) return;
	if (table === "chat_participants" || table === "messages" || table === "chat_threads") {
		const threadId = value(table === "chat_threads" ? "id" : "thread_id");
		const threadIds = filters.find((filter) => filter.column === (table === "chat_threads" ? "id" : "thread_id") && filter.operator === "in" && Array.isArray(filter.value))?.value;
		if (threadIds) {
			if (threadIds.length > 100) throw new Error("Too many thread IDs.");
			if ((await pool.query(`SELECT count(DISTINCT t.id)::int AS count FROM chat_threads t
         WHERE t.id = ANY($1) AND (
           EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.thread_id = t.id AND cp.user_id = $2)
           OR (t.kind = 'group' AND EXISTS (
             SELECT 1 FROM group_members gm WHERE gm.group_id = t.group_id AND gm.user_id = $2
           ))
         )`, [threadIds, userId])).rows[0].count !== new Set(threadIds).size) throw new Error("Forbidden.");
			return;
		}
		if (typeof threadId !== "string" && table === "chat_threads") {
			const groupId = value("group_id");
			if (typeof groupId === "string" && await isGroupMember(userId, groupId)) return;
			throw new Error("Forbidden.");
		}
		if (typeof threadId !== "string") throw new Error("A thread filter is required.");
		if (!(await pool.query(`SELECT 1 FROM chat_threads t
       WHERE t.id = $1 AND (
         EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.thread_id = t.id AND cp.user_id = $2)
         OR (t.kind = 'group' AND EXISTS (
           SELECT 1 FROM group_members gm WHERE gm.group_id = t.group_id AND gm.user_id = $2
         ))
       )`, [threadId, userId])).rowCount) throw new Error("Forbidden.");
		return;
	}
	if (table === "group_comments") {
		const confessionId = value("confession_id");
		if (typeof confessionId !== "string") throw new Error("A confession filter is required.");
		if (!(await pool.query(`SELECT 1 FROM confessions c JOIN group_members gm ON gm.group_id = c.group_id
       WHERE c.id = $1 AND gm.user_id = $2`, [confessionId, userId])).rowCount) throw new Error("Forbidden.");
	}
}
async function runDatabaseRequest(data) {
	try {
		if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
		const userId = await currentUserId();
		const table = data.table;
		if (!userId && (data.action !== "select" || ![
			"confessions",
			"profiles",
			"reactions"
		].includes(table))) throw new Error("Unauthorized.");
		const tableColumns = columns[table];
		const filters = (data.filters ?? []).map(({ column, operator, value }) => ({
			column,
			operator,
			value
		}));
		const params = [];
		const addParam = (value) => {
			params.push(value);
			return `$${params.length}`;
		};
		let where = "";
		if (filters.length) where = " WHERE " + filters.map((filter) => {
			assertColumn(table, filter.column);
			if (filter.operator === "in") {
				if (!Array.isArray(filter.value) || filter.value.length > 500) throw new Error("Invalid IN filter.");
				if (!filter.value.length) return "FALSE";
				return `"${filter.column}" = ANY(${addParam(filter.value)})`;
			}
			if (filter.operator === "is" && filter.value === null) return `"${filter.column}" IS NULL`;
			const operator = {
				eq: "=",
				neq: "<>",
				is: "=",
				ilike: "ILIKE"
			}[filter.operator];
			return `"${filter.column}" ${operator} ${addParam(filter.value)}`;
		}).join(" AND ");
		if (data.action === "select" && (table === "groups" || table === "confessions" || table === "reactions")) {
			params.push(userId);
			const userParameter = `$${params.length}`;
			let visibility = table === "groups" ? `(NOT is_private OR creator_id = ${userParameter} OR EXISTS (
              SELECT 1 FROM group_members gm WHERE gm.group_id = groups.id AND gm.user_id = ${userParameter}
            ))` : table === "confessions" ? `(group_id IS NULL OR EXISTS (
                SELECT 1 FROM group_members gm WHERE gm.group_id = confessions.group_id AND gm.user_id = ${userParameter}
              ))` : `EXISTS (
                SELECT 1 FROM confessions c
                WHERE c.id = reactions.confession_id AND
                  (c.group_id IS NULL OR EXISTS (
                    SELECT 1 FROM group_members gm WHERE gm.group_id = c.group_id AND gm.user_id = ${userParameter}
                  ))
              )`;
			const inviteCode = filters.find((filter) => filter.column === "invite_code" && filter.operator === "eq" && typeof filter.value === "string");
			if (table === "groups" && inviteCode) {
				params.push(inviteCode.value);
				visibility = `(${visibility} OR invite_code = $${params.length})`;
			}
			where += `${where ? " AND " : " WHERE "}${visibility}`;
		}
		if (data.action === "select") {
			await authorizeSelect(userId, table, filters);
			if (table === "profiles") {
				const requested = (data.select ?? "*").split(",").map((column) => column.trim()).filter(Boolean);
				if (!userId) {
					if (!filters.find((filter) => filter.column === "id" && (filter.operator === "eq" || filter.operator === "in" && Array.isArray(filter.value))) || requested.length === 0 || requested.some((column) => ![
						"id",
						"anon_number",
						"is_guest"
					].includes(column))) throw new Error("Only public profile details are available.");
				}
				const userFilter = filters.find((filter) => filter.column === "id" && filter.operator === "eq");
				if ((requested.includes("*") || requested.includes("notifications_enabled")) && userFilter?.value !== userId) throw new Error("Private profile fields are not accessible.");
			}
			if (!userId && table === "reactions") {
				if (!filters.find((filter) => filter.column === "confession_id" && (filter.operator === "eq" || filter.operator === "in" && Array.isArray(filter.value))) || filters.some((filter) => filter.column !== "confession_id") || data.order && ![
					"confession_id",
					"kind",
					"created_at"
				].includes(data.order.column)) throw new Error("Public reaction access must be scoped to confession IDs.");
			}
			const requestedColumns = (data.select ?? "*").split(",").map((column) => column.trim()).filter(Boolean);
			if (requestedColumns.some((column) => column.includes("(") || column.includes("!"))) throw new Error("Related selects are not supported.");
			const selected = requestedColumns.length === 1 && requestedColumns[0] === "*" ? tableColumns : requestedColumns;
			if (!userId && table === "reactions" && selected.some((column) => ![
				"confession_id",
				"kind",
				"user_id",
				"created_at"
			].includes(column))) throw new Error("Only public reaction counts are available.");
			for (const column of selected) assertColumn(table, column);
			const projection = selected.map((column) => !userId && table === "reactions" && column === "user_id" ? "NULL::uuid AS \"user_id\"" : `"${column}"`).join(", ");
			const countSql = data.count ? await pool.query(`SELECT count(*)::int AS count FROM "${table}"${where}`, params) : null;
			if (data.head) return {
				data: null,
				error: null,
				count: countSql?.rows[0]?.count ?? null
			};
			const orderSql = data.order ? (assertColumn(table, data.order.column), ` ORDER BY "${data.order.column}" ${data.order.ascending === false ? "DESC" : "ASC"}`) : "";
			const limitSql = data.limit === void 0 ? !userId ? " LIMIT 500" : "" : ` LIMIT ${data.limit}`;
			const result = await pool.query(`SELECT ${projection} FROM "${table}"${where}${orderSql}${limitSql}`, params);
			if (data.single === "single" && result.rows.length !== 1) throw new Error("Expected exactly one row.");
			if (data.single === "maybeSingle" && result.rows.length > 1) throw new Error("Expected at most one row.");
			return {
				data: data.single ? result.rows[0] ?? null : result.rows,
				error: null,
				count: countSql?.rows[0]?.count ?? null
			};
		}
		if (!userId) throw new Error("Unauthorized.");
		if (data.action === "insert") {
			if (![
				"confessions",
				"group_comments",
				"group_members",
				"groups",
				"messages",
				"reactions",
				"bookmarks",
				"reports",
				"chat_threads"
			].includes(table)) throw new Error("Inserts are not allowed for this resource.");
			const values = Array.isArray(data.values) ? data.values : data.values ? [data.values] : [];
			if (!values.length || values.length > 100) throw new Error("Invalid insert.");
			const client = await pool.connect();
			try {
				await client.query("BEGIN");
				const inserted = [];
				for (const row of values) {
					params.length = 0;
					const entries = Object.entries(row);
					if (!entries.length) throw new Error("Insert values are required.");
					for (const [key] of entries) assertColumn(table, key);
					if (table === "confessions" && row.author_id !== userId) throw new Error("Forbidden.");
					if (table === "messages" && row.sender_id !== userId) throw new Error("Forbidden.");
					if (table === "group_members" && row.user_id !== userId) throw new Error("Forbidden.");
					if (table === "reactions" && row.user_id !== userId) throw new Error("Forbidden.");
					if (table === "bookmarks" && row.user_id !== userId) throw new Error("Forbidden.");
					if (table === "reports" && row.reporter_id !== userId) throw new Error("Forbidden.");
					if (table === "groups" && row.creator_id !== userId) throw new Error("Forbidden.");
					if (table === "chat_threads" && row.kind !== "group") throw new Error("Direct chats must be opened from a confession.");
					if (table === "group_comments" && row.author_id !== userId) throw new Error("Forbidden.");
					if (table === "chat_threads" && row.kind === "group" && typeof row.group_id === "string" && !await isGroupMember(userId, row.group_id)) throw new Error("Forbidden.");
					if (table === "messages") {
						if (!(await client.query(`SELECT 1 FROM chat_threads t WHERE t.id = $1 AND (
                  EXISTS (SELECT 1 FROM chat_participants cp WHERE cp.thread_id=t.id AND cp.user_id=$2)
                  OR (t.kind='group' AND EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id=t.group_id AND gm.user_id=$2))
                )`, [row.thread_id, userId])).rowCount) throw new Error("Forbidden.");
					}
					if (table === "confessions" && typeof row.group_id === "string" && !await isGroupMember(userId, row.group_id)) throw new Error("Join the group before posting.");
					if (table === "group_comments") {
						if (!(await client.query(`SELECT 1 FROM confessions c JOIN group_members gm ON gm.group_id=c.group_id
                 WHERE c.id=$1 AND gm.user_id=$2`, [row.confession_id, userId])).rowCount) throw new Error("Join the group before commenting.");
					}
					if (table === "group_members") {
						const groupId = String(row.group_id ?? "");
						const group = await client.query("SELECT is_private, creator_id FROM groups WHERE id=$1", [groupId]);
						if (!group.rowCount || group.rows[0].is_private && group.rows[0].creator_id !== userId && !await isGroupMember(userId, groupId)) throw new Error("You need a valid invite to join this group.");
						if (row.role === "admin" && group.rows[0].creator_id !== userId) throw new Error("Forbidden.");
					}
					const names = entries.map(([key]) => `"${key}"`).join(", ");
					const placeholders = entries.map(([, value]) => addParam(value)).join(", ");
					const result = await client.query(`INSERT INTO "${table}" (${names}) VALUES (${placeholders}) RETURNING *`, params);
					inserted.push(result.rows[0]);
					if (table === "groups") await client.query("INSERT INTO group_members(group_id, user_id, role) VALUES($1, $2, 'admin')", [result.rows[0].id, userId]);
					if (table === "group_members") await client.query(`INSERT INTO chat_participants(thread_id, user_id)
                 SELECT id, $2 FROM chat_threads WHERE kind = 'group' AND group_id = $1
                 ON CONFLICT DO NOTHING`, [result.rows[0].group_id, result.rows[0].user_id]);
					if (table === "chat_threads" && row.kind === "group" && typeof row.group_id === "string") await client.query(`INSERT INTO chat_participants(thread_id, user_id)
                 SELECT $1, user_id FROM group_members WHERE group_id = $2
                 ON CONFLICT DO NOTHING`, [result.rows[0].id, row.group_id]);
				}
				await client.query("COMMIT");
				return {
					data: Array.isArray(data.values) ? inserted : inserted[0],
					error: null,
					count: inserted.length
				};
			} catch (error) {
				await client.query("ROLLBACK");
				throw error;
			} finally {
				client.release();
			}
		}
		if (!filters.length) throw new Error("A filter is required for update or delete.");
		await authorizeSelect(userId, table, filters);
		if (data.action === "delete") {
			if (table === "profiles") return {
				data: null,
				error: null,
				count: (await pool.query("DELETE FROM users WHERE id=$1 AND id=$2", [userId, filters.find((f) => f.column === "id")?.value])).rowCount
			};
			if (table === "group_members" && filters.find((f) => f.column === "user_id")?.value !== userId) throw new Error("Forbidden.");
			if (table === "reactions" && filters.find((f) => f.column === "user_id")?.value !== userId) throw new Error("Forbidden.");
			if (table === "bookmarks" && filters.find((f) => f.column === "user_id")?.value !== userId) throw new Error("Forbidden.");
			if (![
				"profiles",
				"group_members",
				"reactions",
				"bookmarks",
				"messages"
			].includes(table)) throw new Error("Deletion is not allowed for this resource.");
			if (table === "messages") {
				params.push(userId);
				where += ` AND sender_id = $${params.length}`;
			}
			return {
				data: null,
				error: null,
				count: (await pool.query(`DELETE FROM "${table}"${where}`, params)).rowCount
			};
		}
		const values = data.values;
		if (!values || Array.isArray(values)) throw new Error("Update values are required.");
		const entries = Object.entries(values);
		if (!entries.length) throw new Error("Update values are required.");
		for (const [key] of entries) assertColumn(table, key);
		if (!["profiles", "chat_participants"].includes(table)) throw new Error("Updates are not allowed for this resource.");
		if (table === "profiles" && entries.some(([key]) => key !== "notifications_enabled")) throw new Error("Only notification preferences can be updated.");
		if (table === "profiles" && filters.find((filter) => filter.column === "id")?.value !== userId) throw new Error("Forbidden.");
		if (table === "chat_participants" && entries.some(([key]) => key !== "last_read_at")) throw new Error("Only read status can be updated.");
		if (table === "chat_participants" && filters.find((filter) => filter.column === "user_id")?.value !== userId) throw new Error("Forbidden.");
		const setSql = entries.map(([key, value]) => `"${key}" = ${addParam(value)}`).join(", ");
		const result = await pool.query(`UPDATE "${table}" SET ${setSql}${where} RETURNING *`, params);
		return {
			data: result.rows,
			error: null,
			count: result.rowCount
		};
	} catch (error) {
		return dbError(error);
	}
}
async function runJoinGroupRequest(data) {
	const userId = await currentUserId();
	if (!userId) throw new Error("Sign in required.");
	const client = await pool.connect();
	try {
		await client.query("BEGIN");
		const group = "inviteCode" in data ? await client.query("SELECT id FROM groups WHERE invite_code = $1 AND is_private = true", [data.inviteCode.trim().toUpperCase()]) : await client.query("SELECT id FROM groups WHERE id = $1 AND is_private = false", [data.groupId]);
		if (!group.rowCount) throw new Error("Group not found or invite code is invalid.");
		const groupId = group.rows[0].id;
		await client.query("INSERT INTO group_members(group_id, user_id) VALUES($1, $2) ON CONFLICT DO NOTHING", [groupId, userId]);
		await client.query("COMMIT");
		return { id: groupId };
	} catch (error) {
		await client.query("ROLLBACK");
		throw error;
	} finally {
		client.release();
	}
}
export { currentUserId, runAuthRequest, runDatabaseRequest, runJoinGroupRequest };

import { a as literal, c as record, d as unknown, i as discriminatedUnion, l as string, n as array, o as number, r as boolean, s as object, t as _enum, u as union } from "../_libs/zod.mjs";
// node_modules/.nitro/vite/services/ssr/assets/postgres.schemas-DD-W6Q9u.js
var tableNames = [
	"bookmarks",
	"chat_participants",
	"chat_threads",
	"confessions",
	"group_comments",
	"group_members",
	"groups",
	"messages",
	"notifications",
	"profiles",
	"reactions",
	"reports"
];
var authInput = discriminatedUnion("action", [
	object({ action: literal("current") }),
	object({ action: literal("logout") }),
	object({ action: literal("guest") }),
	object({
		action: literal("signup"),
		email: string().email().max(254),
		password: string().min(10).max(128)
	}),
	object({
		action: literal("signin"),
		email: string().email().max(254),
		password: string().min(1).max(128)
	})
]);
var queryInput = object({
	table: _enum(tableNames),
	action: _enum([
		"select",
		"insert",
		"update",
		"delete"
	]),
	select: string().optional(),
	filters: array(object({
		column: string(),
		operator: _enum([
			"eq",
			"neq",
			"is",
			"ilike",
			"in"
		]),
		value: unknown()
	})).max(20).optional(),
	order: object({
		column: string(),
		ascending: boolean().optional()
	}).optional(),
	limit: number().int().min(0).max(500).optional(),
	values: union([record(string(), unknown()), array(record(string(), unknown()))]).optional(),
	single: _enum(["single", "maybeSingle"]).optional(),
	count: boolean().optional(),
	head: boolean().optional()
});
var groupJoinInput = union([object({ groupId: string().uuid() }), object({ inviteCode: string().trim().min(4).max(32) })]);
export { groupJoinInput as n, queryInput as r, authInput as t };

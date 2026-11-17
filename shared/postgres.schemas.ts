import { z } from "zod";

const tableNames = [
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
  "reports",
] as const;

export const authInput = z.discriminatedUnion("action", [
  z.object({ action: z.literal("current") }),
  z.object({ action: z.literal("logout") }),
  z.object({ action: z.literal("guest") }),
  z.object({
    action: z.literal("signup"),
    email: z.string().email().max(254),
    password: z.string().min(10).max(128),
  }),
  z.object({
    action: z.literal("signin"),
    email: z.string().email().max(254),
    password: z.string().min(1).max(128),
  }),
]);
export type AuthInput = z.infer<typeof authInput>;

export const queryInput = z.object({
  table: z.enum(tableNames),
  action: z.enum(["select", "insert", "update", "delete"]),
  select: z.string().optional(),
  filters: z
    .array(
      z.object({
        column: z.string(),
        operator: z.enum(["eq", "neq", "is", "ilike", "in"]),
        value: z.unknown(),
      }),
    )
    .max(20)
    .optional(),
  order: z.object({ column: z.string(), ascending: z.boolean().optional() }).optional(),
  limit: z.number().int().min(0).max(500).optional(),
  values: z
    .union([z.record(z.string(), z.unknown()), z.array(z.record(z.string(), z.unknown()))])
    .optional(),
  single: z.enum(["single", "maybeSingle"]).optional(),
  count: z.boolean().optional(),
  head: z.boolean().optional(),
});
export type QueryInput = z.infer<typeof queryInput>;

export const groupJoinInput = z.union([
  z.object({ groupId: z.string().uuid() }),
  z.object({ inviteCode: z.string().trim().min(4).max(32) }),
]);
export type GroupJoinInput = z.infer<typeof groupJoinInput>;

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({ confessionId: z.string().uuid() });

function isMissingRpcError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const code = "code" in error && typeof error.code === "string" ? error.code : "";
  return code === "PGRST202" || message.includes("schema cache");
}

async function openThreadWithAdmin(confessionId: string, userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: confession, error: cErr } = await supabaseAdmin
    .from("confessions")
    .select("id, author_id")
    .eq("id", confessionId)
    .maybeSingle();
  if (cErr) throw cErr;
  if (!confession) throw new Error("Confession not found");
  if (confession.author_id === userId) throw new Error("You can't privately reply to yourself.");

  const otherId = confession.author_id;
  const { data: myThreads, error: myThreadsErr } = await supabaseAdmin
    .from("chat_participants")
    .select("thread_id, chat_threads!inner(id, kind)")
    .eq("user_id", userId)
    .eq("chat_threads.kind", "direct");
  if (myThreadsErr) throw myThreadsErr;

  const directThreadIds = (myThreads ?? []).map((row) => row.thread_id);
  if (directThreadIds.length > 0) {
    const { data: shared, error: sharedErr } = await supabaseAdmin
      .from("chat_participants")
      .select("thread_id")
      .eq("user_id", otherId)
      .in("thread_id", directThreadIds)
      .limit(1);
    if (sharedErr) throw sharedErr;
    if (shared?.[0]?.thread_id) return shared[0].thread_id;
  }

  const { data: thread, error: threadErr } = await supabaseAdmin
    .from("chat_threads")
    .insert({ kind: "direct", confession_id: confessionId })
    .select("id")
    .single();
  if (threadErr) throw threadErr;

  const { error: participantsErr } = await supabaseAdmin
    .from("chat_participants")
    .insert([
      { thread_id: thread.id, user_id: userId },
      { thread_id: thread.id, user_id: otherId },
    ]);
  if (participantsErr) throw participantsErr;

  await supabaseAdmin.from("notifications").insert({
    user_id: otherId,
    kind: "private_reply",
    payload: { thread_id: thread.id, confession_id: confessionId },
  });

  return thread.id;
}

/**
 * Open (or return existing) 1:1 direct chat thread between the caller
 * and the author of the given confession. Both users remain anonymous.
 */
export const openPrivateReplyThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const result = await (supabase as any).rpc("open_private_reply_thread", {
      _confession_id: data.confessionId,
    });

    const threadId = result.data ?? (
      isMissingRpcError(result.error)
        ? await openThreadWithAdmin(data.confessionId, userId)
        : undefined
    );
    const error = isMissingRpcError(result.error) ? undefined : result.error;

    if (error) throw error;
    if (!threadId) throw new Error("Couldn't open chat");

    return { threadId };
  });

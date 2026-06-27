import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const InputSchema = z.object({ body: z.string().min(1).max(2000) });

const ResultSchema = z.object({
  allowed: z.boolean(),
  reasons: z.array(z.string()).default([]),
  severity: z.enum(["none", "low", "high"]).default("none"),
});

export type ModerationResult = z.infer<typeof ResultSchema>;

export const moderateConfession = createServerFn({ method: "POST" })
  .validator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<ModerationResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      // Fail open with a soft allow rather than block posting if key missing
      return { allowed: true, reasons: [], severity: "none" };
    }
    try {
      const gateway = createLovableAiGatewayProvider(key);
      const { experimental_output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        experimental_output: Output.object({ schema: ResultSchema }),
        system:
          "You moderate posts for an anonymous confessions app. Block content containing: hate speech, threats of violence, self-harm encouragement, doxxing, exposed phone numbers or emails, sexual content involving minors, or spam. Vulgar venting, mild profanity, sad personal stories, and most relationship/work venting are ALLOWED. Return allowed=false ONLY for the categories above; otherwise allowed=true.",
        prompt: data.body,
      });
      return experimental_output as ModerationResult;
    } catch (e) {
      console.error("moderation error", e);
      return { allowed: true, reasons: [], severity: "none" };
    }
  });

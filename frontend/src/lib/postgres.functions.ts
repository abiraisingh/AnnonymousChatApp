import { createServerFn } from "@tanstack/react-start";
import { authInput, groupJoinInput, queryInput } from "@shared/postgres.schemas";

export const authRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => authInput.parse(data))
  .handler(async ({ data }) => {
    const { runAuthRequest } = await import("@backend/postgres.server");
    return runAuthRequest(data);
  });

export const databaseRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => queryInput.parse(data))
  .handler(async ({ data }) => {
    const { runDatabaseRequest } = await import("@backend/postgres.server");
    return runDatabaseRequest(data);
  });

export const joinGroupRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => groupJoinInput.parse(data))
  .handler(async ({ data }) => {
    const { runJoinGroupRequest } = await import("@backend/postgres.server");
    return runJoinGroupRequest(data);
  });

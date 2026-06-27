import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Send everyone into the app shell; the protected layout handles auth.
    throw redirect({ to: "/feed" });
  },
});

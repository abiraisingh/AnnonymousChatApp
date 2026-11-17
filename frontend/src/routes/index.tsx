import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    // Send visitors to the public feed.
    throw redirect({ to: "/feed" });
  },
});

import { createFileRoute, redirect } from "@tanstack/react-router";

// The archive's entry screen is /auth (all unknown paths redirect there), so
// "/" sends visitors to the same sign-up page to keep every source URL valid.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/auth" });
  },
});

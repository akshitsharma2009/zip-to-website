import { createFileRoute } from "@tanstack/react-router";
import DashboardPage from "@/components/envoke/DashboardPage";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your account — Envoke" },
      { name: "description", content: "Your Envoke account: profile details and your permanent consent record." },
      { property: "og:title", content: "Your account — Envoke" },
      { property: "og:description", content: "Your Envoke account: profile details and your permanent consent record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

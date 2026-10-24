import { createFileRoute } from "@tanstack/react-router";
import CommunityGuidelinesPage from "@/components/envoke/CommunityGuidelinesPage";

export const Route = createFileRoute("/community-guidelines")({
  head: () => ({
    meta: [
      { title: "Community Guidelines — Envoke" },
      { name: "description", content: "How we keep Envoke respectful: expectations, what's not allowed, and how reporting works." },
      { property: "og:title", content: "Community Guidelines — Envoke" },
      { property: "og:description", content: "How we keep Envoke respectful: expectations, what's not allowed, and how reporting works." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityGuidelinesPage,
});

import { createFileRoute } from "@tanstack/react-router";
import TermsPage from "@/components/envoke/TermsPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Envoke" },
      { name: "description", content: "The terms that govern your use of Envoke: eligibility, content rules, moderation, and your rights." },
      { property: "og:title", content: "Terms & Conditions — Envoke" },
      { property: "og:description", content: "The terms that govern your use of Envoke: eligibility, content rules, moderation, and your rights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

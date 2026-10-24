import { createFileRoute } from "@tanstack/react-router";
import PrivacyPage from "@/components/envoke/PrivacyPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Envoke" },
      { name: "description", content: "How Envoke collects, uses, and protects your personal data under the DPDP Act, and the rights you have over it." },
      { property: "og:title", content: "Privacy Policy — Envoke" },
      { property: "og:description", content: "How Envoke collects, uses, and protects your personal data under the DPDP Act, and the rights you have over it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

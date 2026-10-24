import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "@/components/envoke/AuthPage";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Envoke — Create your account" },
      { name: "description", content: "Every song remembers something. Sign up or sign in to write and share memories about the songs you love." },
      { property: "og:title", content: "Envoke — Create your account" },
      { property: "og:description", content: "Every song remembers something. Sign up or sign in to write and share memories about the songs you love." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

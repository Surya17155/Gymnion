import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blank" },
      { name: "description", content: "A blank white page." },
      { property: "og:title", content: "Blank" },
      { property: "og:description", content: "A blank white page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <div className="min-h-screen w-full bg-background" />;
}

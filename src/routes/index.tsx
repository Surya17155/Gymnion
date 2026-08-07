import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HomeContent } from "@/components/HomeContent";

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 * 
 * hello
 */
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GymSync | Track. Manage. Grow." },
      { name: "description", content: "Professional gym management platform with AI-powered insights." },
      { property: "og:title", content: "GymSync | Track. Manage. Grow." },
      { property: "og:description", content: "Professional gym management platform with AI-powered insights." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell showNav={false}>
      <HomeContent />
    </AppShell>
  );
}

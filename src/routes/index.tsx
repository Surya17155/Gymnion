import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HomeContent } from "@/components/HomeContent";

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to GymSync</h1>
        <p className="text-muted-foreground mb-8">Home screen temporarily disabled for development.</p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <a href="/auth/login" className="flex items-center justify-center w-full bg-gym-accent text-primary h-12 rounded-pill font-bold hover:bg-gym-accent-bright transition-all">
            Go to Login
          </a>
        </div>
      </div>
    </AppShell>
  );
}

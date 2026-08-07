import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HomeContent } from "@/components/HomeContent";
import { useEffect } from "react";

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 * 
 * Verify that the tab bar navigation works correctly on mobile for both Admin Dashboard and Admin Members pages without unexpected redirects.
 *
 * when I click on the members button in the tabbar in the admin mode, I am not redirecting to the members page or the members page is not available. please fix this issue
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
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/dashboard/m" });
  }, [navigate]);

  return null;
}

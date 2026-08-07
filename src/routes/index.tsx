import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HomeContent } from "@/components/HomeContent";
import { useEffect } from "react";

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 *
 * I created a red frame on “May 26” written on it. I’m referring to that frame. The “May 26” currently inside a circle should be placed inside a square frame. Please convert the circular frame into a rounded‑square shape.
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

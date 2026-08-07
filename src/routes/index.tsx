import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HomeContent } from "@/components/HomeContent";
import { useEffect } from "react";

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 *
 * Nothing has changed; everything is exactly as it was before. Run a test on the attendance screen and identify the issues that need fixing. There is a lot of empty space on the left and right sides of the screen because the elements and cards are compressed, minimized, or have reduced width. Consequently, a large amount of empty space remains on both sides of the attendance screen. Please fix this. The code I provided earlier for the attendance screen, the tiles, and other cards, including the metrics card, should have proper widths. It does not look bad, but please adjust all those cards and tiles again.
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

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HomeContent } from "@/components/HomeContent";
import { useEffect } from "react";

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 *                                            
 * the problem is not fixed yet, the code is not fitting probably, and this code is supposed to be specifically made for the mobile screen, but you have expanded it for the tab or pc use unknowingly, make sure that this app is only for the mobile users and the screens of all the app is to be adjusted for the mobile users, check again the payments screen UI is not fitting in the mobile screen properly, and fix this issue
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

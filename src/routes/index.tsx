import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { HomeContent } from "@/components/HomeContent";
import { useEffect } from "react";

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 * 
 * Please recheck the attendance UI code file I gave you. The screen in the original code should be exactly the same, but you created something different. The UI alignment is slightly off, and the attendance card contains errors; the dot elements in the Month's attendance have mistakes. 
 * 
 * The log section includes a frame with a date below it, and its UI element also shows changes. Please fix these issues. In the log section, you created a different frame, and the green capsule‑type container appears separately. 
 * 
 * Restore the UI to its original state, same as the attendance UI code file which I have given you earlier and verify also yourself by looking at the design of the UI of the Attendance screen and ensure proper alignment, and adjust the width, which you reduced too much, to match the original attendance file exactly.
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

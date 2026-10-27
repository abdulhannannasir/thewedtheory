"use client";

import { useEffect } from "react";
import type { GlScene } from "@/lib/gl/scene-types";
import { startJourney } from "@/lib/journey/run-journey";

/**
 * Starts the journey's motion (src/lib/journey/run-journey.ts) when the page is ready and undoes
 * all of it when the page goes away. It renders nothing. Mounting twice, as React Strict Mode does in
 * development, is safe: the first start is fully undone before the second begins.
 */
export function JourneyController({ scenes }: { scenes: readonly GlScene[] }) {
  useEffect(() => {
    const track = document.getElementById("journey");
    if (!track) return;
    return startJourney(track, scenes);
  }, [scenes]);
  return null;
}

"use client";

import { usePathname } from "next/navigation";
import { JOURNEY } from "./journey-content";

/**
 * The first thing a keyboard or screen-reader visitor reaches, visible only while focused. On the
 * front page it jumps past the long scrolling journey to the services; on every other page it jumps
 * past the header to the page's content.
 */
export function SkipLink() {
  const home = usePathname() === "/";
  return (
    <a
      href={home ? JOURNEY.skip.href : "#main"}
      className="sr-only z-[80] bg-cream font-ui text-sm text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:px-5 focus:py-3.5 focus:ring-2 focus:ring-forest"
    >
      {home ? JOURNEY.skip.label : "Skip to content"}
    </a>
  );
}

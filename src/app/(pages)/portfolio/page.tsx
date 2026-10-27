import type { Metadata } from "next";
import { ClosingCta } from "@/components/sites/twt/closing-cta";
import { PORTFOLIO } from "@/components/sites/twt/content";
import { PageIntro } from "@/components/sites/twt/page-intro";
import { PortfolioDetails } from "@/components/sites/twt/portfolio-details";
import { PortfolioGrid } from "@/components/sites/twt/portfolio-grid";
import { TheoryBanner } from "@/components/sites/twt/theory-banner";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  title: "Portfolio",
  description:
    "Grand entrances, bespoke stages, floral architecture, custom table settings and lighting from The Wed Theory Events, Lahore.",
  path: "/portfolio",
});

export default function PortfolioPage() {
  return (
    <>
      <PageIntro
        eyebrow={PORTFOLIO.eyebrow}
        headline={PORTFOLIO.headline}
        intro={PORTFOLIO.intro}
      />
      <PortfolioGrid />
      <PortfolioDetails />
      <TheoryBanner />
      <ClosingCta />
    </>
  );
}

import type { Metadata } from "next";
import { ClosingCta } from "@/components/sites/twt/closing-cta";
import { PORTFOLIO } from "@/components/sites/twt/content";
import { PageIntro } from "@/components/sites/twt/page-intro";
import { PortfolioGrid } from "@/components/sites/twt/portfolio-grid";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Grand entrances, bespoke stages, floral architecture, custom table settings and lighting from The Wed Theory Events, Lahore.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageIntro
        eyebrow={PORTFOLIO.eyebrow}
        headline={PORTFOLIO.headline}
        intro={PORTFOLIO.intro}
      />
      <PortfolioGrid />
      <ClosingCta />
    </>
  );
}

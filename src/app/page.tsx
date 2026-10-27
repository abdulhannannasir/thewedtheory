import type { Metadata } from "next";
import { BRAND } from "@/components/sites/twt/content";
import { CinematicJourney } from "@/components/sites/twt/cinematic-journey";
import { ContactSection } from "@/components/sites/twt/contact-section";
import { LocalBusinessSchema } from "@/components/sites/twt/local-business-schema";
import { PlanningProcess } from "@/components/sites/twt/planning-process";
import { PortfolioSection } from "@/components/sites/twt/portfolio-section";
import { ServicesOverview } from "@/components/sites/twt/services-overview";
import { SiteFooter } from "@/components/sites/twt/site-footer";

// The home page keeps the full default title from the layout; this adds its canonical link.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: { absolute: `${BRAND.fullName} | Event Planning & Design in ${BRAND.city}` },
};

/**
 * The front page: the scrolling journey (hero, three event environments, finale), then the services,
 * how an enquiry becomes a plan, a look at the work, and the enquiry form.
 */
export default function Home() {
  return (
    <>
      <LocalBusinessSchema />
      <main id="main" className="flex-1">
        <CinematicJourney />
        <ServicesOverview />
        <PlanningProcess />
        <PortfolioSection />
        <div className="bg-ivory">
          <ContactSection />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

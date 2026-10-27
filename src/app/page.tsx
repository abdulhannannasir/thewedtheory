import type { Metadata } from "next";
import { BRAND } from "@/components/sites/twt/content";
import { Hero } from "@/components/sites/twt/hero";
import { LocalBusinessSchema } from "@/components/sites/twt/local-business-schema";
import { ServicesStrip } from "@/components/sites/twt/services-strip";

// The home page keeps the full default title from the layout; this adds its canonical link.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  title: { absolute: `${BRAND.fullName} | Event Planning & Design in ${BRAND.city}` },
};

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <LocalBusinessSchema />
      <main className="flex flex-1 flex-col">
        <Hero />
        <ServicesStrip />
      </main>
    </div>
  );
}

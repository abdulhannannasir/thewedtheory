import { Hero } from "@/components/sites/twt/hero";
import { ServicesStrip } from "@/components/sites/twt/services-strip";
import { SiteHeader } from "@/components/sites/twt/site-header";

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <ServicesStrip />
      </main>
    </div>
  );
}

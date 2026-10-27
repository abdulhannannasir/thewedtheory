import { Hero } from "@/components/sites/twt/hero";
import { ServicesStrip } from "@/components/sites/twt/services-strip";

export default function Home() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <main className="flex flex-1 flex-col">
        <Hero />
        <ServicesStrip />
      </main>
    </div>
  );
}

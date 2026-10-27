import type { Metadata } from "next";
import { ContactSection } from "@/components/sites/twt/contact-section";
import { CONTACT } from "@/components/sites/twt/content";
import { PageIntro } from "@/components/sites/twt/page-intro";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Enquire about a wedding, social event or corporate function with The Wed Theory Events in Lahore. Send us a few details and we’ll pick up the conversation on WhatsApp.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro eyebrow={CONTACT.eyebrow} headline={CONTACT.headline} intro={CONTACT.intro} />
      <ContactSection />
    </>
  );
}

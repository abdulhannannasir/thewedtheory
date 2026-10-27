import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost, Mrs_Saint_Delafield } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_CARD } from "@/lib/metadata";
import { SITE_URL } from "@/lib/site";
import { BRAND } from "@/components/sites/twt/content";
import { INTRO_GUARD_SCRIPT } from "@/components/sites/twt/intro";
import { InstagramButton } from "@/components/sites/twt/instagram-button";
import { IntroSequence } from "@/components/sites/twt/intro-sequence";
import { SiteHeader } from "@/components/sites/twt/site-header";
import { SkipLink } from "@/components/sites/twt/skip-link";
import { PointerEffects } from "@/components/ui/pointer-effects";
import "./globals.css";
import "./journey.css";

// The brand's serif: high-contrast, light and italic-friendly, for every line of text on the site.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

// A clean, light sans for navigation, buttons, small labels, descriptions and the enquiry form.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

// A flowing handwritten script, the closest open match to the sign-off in the design.
const script = Mrs_Saint_Delafield({
  variable: "--font-mrs-saint",
  subsets: ["latin"],
  weight: "400",
});

const DESCRIPTION = `Wedding planning and event design in ${BRAND.city}. ${BRAND.name} plans weddings, social celebrations, birthdays and corporate events, tailored to you. Enquire today.`;

export const metadata: Metadata = {
  // Share-preview images and links must be absolute; this is what turns "/portfolio" into a full address.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.fullName} | Event Planning & Design in ${BRAND.city}`,
    template: `%s | ${BRAND.fullName}`,
  },
  description: DESCRIPTION,
  applicationName: BRAND.fullName,
  // Pages with their own openGraph (see pageMetadata) replace this object, so each one names the card too.
  openGraph: {
    type: "website",
    siteName: BRAND.fullName,
    locale: "en_PK",
    title: `${BRAND.fullName} | Event Planning & Design in ${BRAND.city}`,
    description: DESCRIPTION,
    url: "/",
    images: [{ url: SITE_CARD.url, width: 1200, height: 630, alt: SITE_CARD.alt }],
  },
  twitter: {
    card: "summary_large_image",
    images: [{ url: SITE_CARD.url, alt: SITE_CARD.alt }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f0ede2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      // The inline script below sets data-intro on <html> before React hydrates.
      suppressHydrationWarning
      className={`${cormorant.variable} ${jost.variable} ${script.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GUARD_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SkipLink />
        <IntroSequence />
        <SiteHeader />
        {children}
        <InstagramButton />
        <PointerEffects />
        <Analytics />
      </body>
    </html>
  );
}

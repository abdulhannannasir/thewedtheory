import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Mrs_Saint_Delafield } from "next/font/google";
import { BRAND } from "@/components/sites/twt/content";
import { SiteHeader } from "@/components/sites/twt/site-header";
import "./globals.css";

// The brand's serif: high-contrast, light and italic-friendly, for every line of text on the site.
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

// A flowing handwritten script, the closest open match to the sign-off in the design.
const script = Mrs_Saint_Delafield({
  variable: "--font-mrs-saint",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.fullName} | Event Planning & Design in ${BRAND.city}`,
    template: `%s | ${BRAND.fullName}`,
  },
  description: `Thoughtfully planned, beautifully celebrated. ${BRAND.name} plans tailored weddings, social events and corporate functions in ${BRAND.city}.`,
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
      className={`${cormorant.variable} ${script.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}

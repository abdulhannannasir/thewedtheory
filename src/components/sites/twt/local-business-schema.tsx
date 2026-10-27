import { SITE_URL } from "@/lib/site";
import { BRAND, SOCIAL } from "./content";

/**
 * Tells search engines, in the structured form they read, who the business is and where it works:
 * a professional service in Lahore. It is shown to visitors nowhere. There is no street address in
 * the site's content, so none is claimed; add one here (and to the Google Business Profile) when
 * there is a studio people can visit.
 */
export function LocalBusinessSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: BRAND.fullName,
    alternateName: BRAND.name,
    url: SITE_URL,
    logo: `${SITE_URL}${BRAND.logo.src}`,
    image: `${SITE_URL}/images/custom-table.jpg`,
    description: `Event planning and design in ${BRAND.city}: tailored weddings, social events and corporate functions.`,
    telephone: SOCIAL.whatsapp.display,
    address: { "@type": "PostalAddress", addressLocality: BRAND.city, addressCountry: "PK" },
    areaServed: { "@type": "City", name: BRAND.city },
    sameAs: [SOCIAL.instagram.href],
  };

  return (
    <script
      type="application/ld+json"
      // `<` is escaped so the data can never close the script tag (the pattern Next recommends).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

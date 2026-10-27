/**
 * Everything the visitor reads or follows on the front page lives in this file: brand, navigation,
 * hero copy and photo, the services strip and its links. To reword the page, swap a photo or point a
 * button somewhere new, edit this file only. No component needs to change.
 *
 * PHOTO RULES FOR THE HERO
 * - It is a full-bleed background, cover-cropped to the screen, so the edges are cut on screens with
 *   a different shape than the photo.
 * - The headline sits on the LEFT over a dark scrim, and the nav sits across the TOP over a pale
 *   drape. Keep the left calm and the subject (candles, florals) in the right 60% of the frame.
 * - Landscape `src`: 16:9, at least 2400 x 1350 px. Phones use `mobileSrc`: portrait, about 9:16,
 *   at least 1152 x 2064 px. Drop files in /public/images and update the paths here.
 */

export type Link = { label: string; href: string };

export const BRAND = {
  name: "The Wed Theory",
  fullName: "The Wed Theory Events",
  city: "Lahore",
  /** The logo: TWT monogram, script name, EVENTS. A PNG with a transparent background. */
  logo: {
    src: "/images/twt-logo.png",
    /** The file's size in pixels. Only used to reserve space and keep proportions. */
    width: 1600,
    height: 612,
    alt: "The Wed Theory Events",
  },
} as const;

/** https://wa.me/<country code + number, digits only>. Opens a chat with that number. */
const WHATSAPP = "https://wa.me/923137027761";

/** A WhatsApp link that opens with the first line of the message already typed. */
const whatsapp = (message: string) => `${WHATSAPP}?text=${encodeURIComponent(message)}`;

export const NAV = {
  /** The first link whose `href` equals the current path is shown as the current page. */
  links: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/#services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" },
  ],
  contact: { label: "Contact", href: WHATSAPP },
  enquire: {
    label: "Enquire",
    href: whatsapp("Hello The Wed Theory, I’d like to enquire about planning an event."),
  },
  menuOpen: "Open menu",
  menuClose: "Close menu",
  menuLabel: "Main menu",
} as const;

export const HERO = {
  eyebrow: "Event Planning & Design",
  /** Two lines; the second one is set in italic. */
  headline: ["Thoughtfully planned.", "Beautifully celebrated."],
  /** Each entry is one line on screens wide enough to hold it. */
  intro: [
    "From intimate gatherings to grand celebrations,",
    "we plan events that reflect your story.",
  ],
  cta: {
    label: "Plan Your Event",
    href: whatsapp("Hello The Wed Theory, I’d like to plan an event."),
  },
  photo: {
    src: "/images/custom-table.jpg",
    width: 2400,
    height: 1350,
    mobileSrc: "/images/custom-table-mobile.jpg",
    mobileWidth: 1152,
    mobileHeight: 2064,
    /** CSS object-position of the crop on large screens and on phones. */
    focus: "50% 62%",
    mobileFocus: "62% 50%",
  },
  /** Sheer ivory drapes laid over the top of the photo and faded out downward. */
  drapes: {
    src: "/images/hero-drapes.jpg",
    width: 2400,
    height: 1350,
  },
} as const;

export type ServiceIcon = "rings" | "sprig" | "briefcase";

export const SERVICES = {
  /** URL hash that scrolls to the strip (/#services). */
  id: "services",
  kicker: "Our Services",
  intro:
    "We offer tailored planning and coordination for weddings, social events and corporate functions in Lahore.",
  link: { label: "Explore Services", href: "/#services" },
  items: [
    {
      id: "weddings",
      icon: "rings",
      title: "Weddings",
      blurb: ["Your special day,", "thoughtfully planned."],
    },
    {
      id: "social-events",
      icon: "sprig",
      title: "Social Events",
      blurb: ["Meaningful celebrations,", "beautifully executed."],
    },
    {
      id: "corporate-events",
      icon: "briefcase",
      title: "Corporate Events",
      blurb: ["Professional events", "with a personal touch."],
    },
  ],
  /** Handwritten sign-off, one entry per line. */
  tagline: ["More than", "events, we create", "memories."],
} as const satisfies {
  id: string;
  kicker: string;
  intro: string;
  link: Link;
  items: readonly { id: string; icon: ServiceIcon; title: string; blurb: readonly string[] }[];
  tagline: readonly string[];
};

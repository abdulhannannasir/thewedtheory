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

/* ------------------------------------------------------------------------------------------------
 * Inner pages: footer, portfolio and about. Same rule as above: edit the words here.
 * ---------------------------------------------------------------------------------------------- */

export const SOCIAL = {
  whatsapp: { label: "WhatsApp", href: WHATSAPP },
  /** https://www.instagram.com/<handle without the @>/ */
  instagram: {
    label: "Instagram",
    handle: "@thewedtheory",
    href: "https://www.instagram.com/thewedtheory/",
  },
} as const;

export const FOOTER = {
  tagline: "Thoughtfully planned. Beautifully celebrated.",
  location: "Lahore, Pakistan",
  exploreLabel: "Explore",
  contactLabel: "Contact",
} as const;

/** The closing call to action at the bottom of the portfolio and about pages. */
export const CLOSING = {
  eyebrow: "Begin",
  headline: "Let’s plan your event.",
  body: "Tell us a little about your day and we’ll pick up the conversation on WhatsApp.",
  button: {
    label: "Plan Your Event",
    href: whatsapp("Hello The Wed Theory, I’d like to plan an event."),
  },
} as const;

export type PortfolioItem = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  /** How wide the tile is on large screens: feature = 7 of 12 columns, side = 5, third = 4. */
  layout: "feature" | "side" | "third";
  photo: {
    /** Landscape, 16:9, at least 2400 x 1350 px. Path under /public. */
    src: string;
    alt: string;
    /** CSS object-position: where the crop is anchored. "50% 50%" is the centre. */
    focus: string;
  };
};

/**
 * PHOTO RULES FOR THE PORTFOLIO
 * - Every tile is cover-cropped, and the shape changes with the screen (wide on desktop, square-ish
 *   in the narrow tiles, portrait on phones). Keep the subject in the middle of the frame and use
 *   `focus` to shift the crop if it sits off-centre.
 * - These are the concept photos from the earlier site. Swap in real event photography when you
 *   have it, keeping the same file names or updating `src`.
 */
export const PORTFOLIO = {
  eyebrow: "Portfolio",
  headline: ["Every detail,", "quietly considered."],
  intro:
    "A look at the details we design most: the entrances, stages, florals, tables and light that decide how an event feels.",
  items: [
    {
      id: "grand-entrances",
      kicker: "The first hello",
      title: "Grand Entrances",
      body: "Arrive between walls of white roses and sheer drapery. Candlelit aisles and a glow underfoot turn the first step into a moment nobody forgets.",
      layout: "feature",
      photo: {
        src: "/images/grand-entrance.jpg",
        alt: "Candlelit aisle leading to an arch of white roses and baby’s breath",
        focus: "50% 55%",
      },
    },
    {
      id: "bespoke-stage-backdrop",
      kicker: "Where every eye lands",
      title: "Bespoke Stage & Backdrop Design",
      body: "Sculpted arches wrapped in roses, silk that falls like a waterfall, a warm light painted just for you. Your vows, spoken inside a work of art.",
      layout: "side",
      photo: {
        src: "/images/bespoke-stage.jpg",
        alt: "Ceremony stage with an arch of white roses and floor-length ivory drapes",
        focus: "50% 50%",
      },
    },
    {
      id: "floral-architecture",
      kicker: "Blooms that forgot gravity",
      title: "Floral Architecture",
      body: "Cascades of white roses and baby’s breath pour from the ceiling. Clouds of blooms hang in mid-air, and the room feels like it is still unfolding.",
      layout: "third",
      photo: {
        src: "/images/floral-architecture.jpg",
        alt: "Suspended installation of white roses, baby’s breath and sage foliage above a candlelit table",
        focus: "50% 40%",
      },
    },
    {
      id: "custom-table-settings",
      kicker: "Luxury, up close",
      title: "Custom Table Settings",
      body: "Linen that falls like silk. Tall tapers glowing in glass, centrepieces of garden roses and baby’s breath, candlelight pooling on gilded rims.",
      layout: "third",
      photo: {
        src: "/images/custom-table.jpg",
        alt: "Long table with ivory linen, gold-rimmed plates and tall candles in glass beside white roses",
        focus: "68% 60%",
      },
    },
    {
      id: "lighting-ambience",
      kicker: "The room, in a mood",
      title: "Lighting & Ambience",
      body: "Crystal chandeliers and canopies of fairy lights shimmer overhead. Candelabras glow, silk catches the light, and the whole night turns to amber.",
      layout: "third",
      photo: {
        src: "/images/lighting-ambience.jpg",
        alt: "Crystal chandelier and a canopy of fairy lights above candlelit banquet tables",
        focus: "50% 40%",
      },
    },
  ],
} as const satisfies {
  eyebrow: string;
  headline: readonly [string, string];
  intro: string;
  items: readonly PortfolioItem[];
};

export const ABOUT = {
  eyebrow: "About",
  headline: ["Planned with care.", "Celebrated with you."],
  intro:
    "The Wed Theory is an event planning and design studio in Lahore. We plan weddings, social events and corporate functions, and we design each one around the people it is for.",
  photo: {
    src: "/images/floral-architecture.jpg",
    alt: "Suspended installation of white roses, baby’s breath and sage foliage above a candlelit table",
    focus: "42% 40%",
  },
  approach: {
    kicker: "Our approach",
    paragraphs: [
      "We believe an event should feel like it could only have been yours. So we start with your story, then build the setting around it: the flowers, the light, the table, the order of the evening.",
      "From the first conversation to the last guest leaving, we look after the details, so you can be present for your own celebration.",
    ],
  },
  process: {
    kicker: "How we work",
    title: "From first conversation to final toast",
    steps: [
      {
        title: "Listen",
        body: "We begin with a conversation about your story, your guests and how you want the day to feel.",
      },
      {
        title: "Design",
        body: "We shape the look and the plan: palette, florals, lighting, layout and timeline, shared with you before anything is booked.",
      },
      {
        title: "Plan",
        body: "We coordinate vendors, schedules and logistics, and keep you informed at every step.",
      },
      {
        title: "Celebrate",
        body: "On the day we run the details, so you can enjoy every moment of it.",
      },
    ],
  },
  services: {
    kicker: "What we plan",
    title: "Events of every kind",
  },
} as const;

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

import type { MasonryItem } from "@/components/ui/masonry-gallery";

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
export const whatsapp = (message: string) => `${WHATSAPP}?text=${encodeURIComponent(message)}`;

export const NAV = {
  /** The first link whose `href` equals the current path is shown as the current page. */
  links: [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" },
  ],
  contact: { label: "Contact", href: "/contact" },
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
  link: { label: "Explore Services", href: "/services" },
  items: [
    {
      id: "weddings",
      icon: "rings",
      href: "/services/weddings",
      title: "Weddings",
      blurb: ["Your special day,", "thoughtfully planned."],
    },
    {
      id: "social-events",
      icon: "sprig",
      href: "/services/social-events",
      title: "Social Events",
      blurb: ["Meaningful celebrations,", "beautifully executed."],
    },
    {
      id: "corporate-events",
      icon: "briefcase",
      href: "/services/corporate-events",
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
  items: readonly {
    id: string;
    icon: ServiceIcon;
    /** The service's own page. */
    href: string;
    title: string;
    blurb: readonly string[];
  }[];
  tagline: readonly string[];
};

/* ------------------------------------------------------------------------------------------------
 * Inner pages: footer, portfolio and about. Same rule as above: edit the words here.
 * ---------------------------------------------------------------------------------------------- */

export const SOCIAL = {
  whatsapp: { label: "WhatsApp", display: "+92 313 7027761", href: WHATSAPP },
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
  servicesLabel: "Celebrations",
  /** Pages listed after the main navigation in the footer's Explore list. */
  moreLinks: [{ label: "Find your theory", href: "/theory" }],
  contactLabel: "Contact",
} as const;

export type ClosingContent = {
  eyebrow: string;
  headline: string;
  body: string;
  button: Link;
  /** Quieter next steps for visitors who are not ready to message us yet. */
  secondary: readonly Link[];
};

/** The closing call to action at the bottom of the portfolio and about pages (the service pages have their own). */
export const CLOSING = {
  eyebrow: "Begin",
  headline: "Let’s plan your event.",
  body: "Tell us a little about your day and we’ll pick up the conversation on WhatsApp.",
  button: {
    label: "Plan Your Event",
    href: whatsapp("Hello The Wed Theory, I’d like to plan an event."),
  },
  /** A quieter second step for visitors who are not ready to message us yet. */
  secondary: [{ label: "Not sure yet? Find your Wed Theory", href: "/theory" }],
} as const satisfies ClosingContent;

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

/** The page shown for an address that does not exist. */
export const NOT_FOUND = {
  eyebrow: "Page not found",
  headline: ["This page has", "wandered off."],
  intro: "The address may have changed, or it never existed. These will take you somewhere lovely.",
  links: [
    { label: "Back to the front page", href: "/" },
    { label: "See our services", href: "/services" },
    { label: "See our portfolio", href: "/portfolio" },
    { label: "Find your Wed Theory", href: "/theory" },
    { label: "Get in touch", href: "/contact" },
  ],
} as const satisfies {
  eyebrow: string;
  headline: readonly [string, string];
  intro: string;
  links: readonly Link[];
};

/**
 * THE CONTACT PAGE
 * There is no server behind this site, so the enquiry form hands over to WhatsApp: it builds a
 * message from the visitor's answers and opens a chat with the number above. Nothing is stored.
 * To receive enquiries another way (an email service, a CRM), replace `onSubmit` in
 * contact-form.tsx; the copy, labels and options below can stay.
 */
export const CONTACT = {
  eyebrow: "Contact",
  headline: ["Tell us about", "your celebration."],
  intro:
    "Share a few details and we’ll pick up the conversation on WhatsApp. Prefer to message us directly? You can reach us any of the ways below.",
  details: {
    kicker: "Reach us",
    whatsappNote: "Chat with us directly",
    instagramNote: "See our latest work",
    locationLabel: "Based in",
  },
  form: {
    id: "enquire",
    title: "Enquire about your event",
    intro: "Tell us a little about your day and we’ll pick up the conversation on WhatsApp.",
    submitLabel: "Send via WhatsApp",
    /** First line of the WhatsApp message the form prepares for the visitor to send. */
    messageGreeting: "Hello The Wed Theory, I’d like to enquire about an event.",
    privacyNote: "Your details open in WhatsApp as a message. Nothing is stored on this website.",
    requiredNote: "Fields marked * are required.",
    /** Shown above the fields when the visitor arrives from a quiz result. */
    theoryNote: (name: string) =>
      `Your answers from the quiz (${name}) are already filled in. Change anything you like.`,
    sent: {
      title: "Your enquiry is ready",
      body: "WhatsApp should have opened with your details. If it didn’t, use the link below.",
      linkLabel: "Open WhatsApp",
    },
    /** `summary` is the short label each answer gets in the WhatsApp message. */
    fields: {
      name: {
        label: "Your name",
        summary: "Name",
        placeholder: "Full name",
        error: "Please tell us your name.",
      },
      eventType: {
        label: "Event type",
        summary: "Event",
        placeholder: "Choose one",
        options: ["Wedding", "Birthday", "Social event", "Corporate event", "Something else"],
        error: "Please choose the kind of event.",
      },
      date: {
        label: "Event date",
        summary: "Date",
        placeholder: "Approximate is fine, e.g. December 2026",
      },
      guests: {
        label: "Guests",
        summary: "Guests",
        placeholder: "Approximate number",
        error: "Please enter a whole number, like 150.",
      },
      venue: {
        label: "Venue or city",
        summary: "Venue",
        placeholder: "Or “still deciding”",
      },
      details: {
        label: "Anything else we should know?",
        summary: "Details",
        placeholder: "Your style, ideas, budget or questions",
      },
    },
  },
} as const;

/**
 * THE OPENING ANIMATION
 * The logo reveal plays once, full screen, the first time a visitor opens the home page in a
 * browser session, then dissolves into the hero. It is skipped for visitors who prefer reduced
 * motion, and a Skip button, a click, a tap or the Escape key ends it early.
 *
 * VIDEO RULES: square, with a FLAT background of exactly `background` so the edges disappear into
 * the page, and the logo centred. Keep it small (this one is about 430 KB): it is fetched on the
 * first visit. To swap it, replace the files under /public/videos and update the paths and times.
 */
export const INTRO = {
  video: {
    src: "/videos/twt-logo-reveal.mp4",
    /** The video's first frame, shown while it loads. */
    poster: "/videos/twt-logo-reveal-poster.jpg",
  },
  /**
   * The video's flat edge colour as a browser shows it (the file is BT.709, so this is a little
   * lighter than a raw pixel read), so its square blends into the screen. Its edges are also faded.
   */
  background: "#fcf3e6",
  /** Seconds into the video at which it starts to dissolve. The light sweep ends near 3.5. */
  fadeAt: 4.2,
  /** Length of the dissolve, in milliseconds. */
  fadeMs: 800,
  /** If the video has not started by then (slow connection, autoplay blocked), skip the intro. */
  startTimeoutMs: 3000,
  /** The longest the intro may ever stay up, whatever happens. */
  maxMs: 8000,
  label: "The Wed Theory Events intro",
  skipLabel: "Skip intro",
} as const;

/**
 * THE DETAIL GALLERY (portfolio page, under the five collections)
 * A masonry of close-ups cut from the collection photos. Each tile's `kicker` names the collection
 * it belongs to. `height` is the tile's height relative to its width on a scale where 400 is a
 * square (see MasonryItem), so it must match the picture's shape. Items fill the shortest column in
 * this order, which was chosen to keep the columns even from 2 to 5 wide: if you add or reorder
 * pictures, check the bottom edge on a wide screen and a phone.
 *
 * To use real photography, drop the files in /public/images/details and update `img`, `height`,
 * `alt` and `title` here.
 */
export const PORTFOLIO_DETAILS = {
  kicker: "In detail",
  title: "Close up",
  intro:
    "The textures, light and florals that make a setting feel considered, seen a little closer.",
  items: [
    {
      id: "candelabra",
      img: "/images/details/candelabra.jpg",
      height: 560,
      kicker: "Lighting & Ambience",
      title: "Candelabra glow",
      alt: "A tall brass candelabra with lit tapers beside a long candlelit table",
    },
    {
      id: "place-setting",
      img: "/images/details/place-setting.jpg",
      height: 245,
      kicker: "Custom Table Settings",
      title: "Gilded place setting",
      alt: "A gold-rimmed plate with a folded napkin, a sprig of greenery and gold cutlery on ivory linen",
    },
    {
      id: "sheer-drapery",
      img: "/images/details/sheer-drapery.jpg",
      height: 455,
      kicker: "Silk & drape",
      title: "Sheer drapery",
      alt: "Soft folds of sheer ivory silk falling in warm light",
    },
    {
      id: "floral-cascade",
      img: "/images/details/floral-cascade.jpg",
      height: 320,
      kicker: "Floral Architecture",
      title: "Floral cascade",
      alt: "A hanging cloud of white roses, baby’s breath and sage foliage with trailing blooms",
    },
    {
      id: "taper-and-roses",
      img: "/images/details/taper-and-roses.jpg",
      height: 390,
      kicker: "Custom Table Settings",
      title: "Tapers & garden roses",
      alt: "A tall taper candle in glass beside a centrepiece of garden roses and baby’s breath",
    },
    {
      id: "chandelier",
      img: "/images/details/chandelier.jpg",
      height: 480,
      kicker: "Lighting & Ambience",
      title: "Crystal chandelier",
      alt: "A crystal chandelier with lit candles beneath a canopy of fairy lights",
    },
    {
      id: "floral-arch",
      img: "/images/details/floral-arch.jpg",
      height: 535,
      kicker: "Bespoke Stage & Backdrop",
      title: "The floral arch",
      alt: "The side of a tall arch covered in white roses and greenery against ivory drapes",
    },
    {
      id: "arch-garland",
      img: "/images/details/arch-garland.jpg",
      height: 445,
      kicker: "Grand Entrances",
      title: "Garland & silk",
      alt: "A garland of white roses over an archway with silk drapes and a glow of fairy lights beyond",
    },
    {
      id: "aisle-blooms",
      img: "/images/details/aisle-blooms.jpg",
      height: 370,
      kicker: "Grand Entrances",
      title: "Aisle blooms",
      alt: "White roses and baby’s breath beside a lit taper in a tall glass along a wooden aisle",
    },
    {
      id: "candlelit-base",
      img: "/images/details/candlelit-base.jpg",
      height: 195,
      kicker: "Bespoke Stage & Backdrop",
      title: "Candlelit base",
      alt: "Pillar candles in glass among low white florals at the foot of a stage",
    },
  ],
} as const satisfies {
  kicker: string;
  title: string;
  intro: string;
  items: readonly MasonryItem[];
};

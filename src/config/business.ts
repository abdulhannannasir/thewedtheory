/**
 * THE BUSINESS, IN ONE PLACE
 *
 * Contact details and enquiry settings that components and the enquiry API depend on. Nothing in
 * this file is a secret: it ships to visitors. Secrets (where enquiries are delivered) live in
 * environment variables, named below, and are only ever read on the server.
 *
 * This file has no imports on purpose, so the enquiry API and its tests can use it without the
 * rest of the site.
 */

/** https://wa.me/<country code + number, digits only>. Change this to move every WhatsApp link. */
export const WHATSAPP_NUMBER = "923137027761";

/** The number as people read it. */
export const WHATSAPP_DISPLAY = "+92 313 7027761";

/** Opens a chat with the studio. */
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/** A WhatsApp link that opens with the message already typed. */
export const whatsapp = (message: string) => `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;

/**
 * THE ENQUIRY FORM
 *
 * Where an enquiry goes is decided on the server, from the environment variable named in
 * `destinationEnv`: a URL that accepts a JSON POST (Formspree, Make, Zapier, n8n, a Google Apps
 * Script, your own CRM). See README, "Receiving enquiries". Until it is set, the form cannot reach
 * the studio by itself, says so, and hands the visitor a ready-made WhatsApp message instead. It
 * never claims an enquiry was sent when it was not.
 */
export const ENQUIRY = {
  /** The server environment variable that holds the delivery URL. */
  destinationEnv: "ENQUIRY_WEBHOOK_URL",

  /**
   * Event types. The first four match the service pages (see `eventType` in services-content.ts),
   * so /contact?service=birthdays chooses "Birthday" on its own: keep those labels in step.
   */
  eventTypes: ["Wedding", "Birthday", "Social event", "Corporate event", "Something else"],

  /**
   * Budget ranges in Pakistani rupees. These are starting suggestions: edit them to suit the
   * events the studio usually plans. The last entry is for visitors who would rather not say.
   */
  budgetRanges: [
    "Under PKR 500,000",
    "PKR 500,000 – 1,500,000",
    "PKR 1,500,000 – 3,000,000",
    "PKR 3,000,000 – 6,000,000",
    "PKR 6,000,000 and above",
    "Not sure yet",
  ],

  /**
   * The event type each service page pre-selects (/contact?service=birthdays). One place for it, so
   * the service pages and the form always agree, and the form does not need the service copy.
   */
  serviceEventTypes: {
    weddings: "Wedding",
    birthdays: "Birthday",
    "social-events": "Social event",
    "corporate-events": "Corporate event",
  },

  /** The largest guest count the form accepts. */
  guestsMax: 5000,

  /** Longest accepted answers, in characters. The server enforces the same limits. */
  limits: { name: 80, venue: 140, details: 1500 },
} as const;

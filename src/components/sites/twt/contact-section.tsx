import { CONTACT, FOOTER, SOCIAL } from "./content";
import { ContactForm } from "./contact-form";
import { SiteLink } from "./site-link";

const kicker = "text-[10px] leading-none font-medium tracking-[0.22em] text-ink-soft uppercase";
const value =
  "text-[clamp(1.25rem,1.8vw,1.625rem)] leading-[1.15] text-ink transition-colors duration-300 outline-none hover:text-ink-soft focus-visible:underline focus-visible:underline-offset-4";

/**
 * The body of the contact page: the ways to reach the studio on the left, the enquiry form on the
 * right. They stack on phones, with the form first because it is what most visitors came for.
 */
export function ContactSection() {
  const { details } = CONTACT;
  return (
    <section
      aria-label={CONTACT.eyebrow}
      className="mx-auto grid max-w-[1760px] gap-14 border-t border-line px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-[6.56vw] lg:py-24"
    >
      <div className="lg:order-2 lg:col-span-7 lg:col-start-6">
        <ContactForm />
      </div>

      <div className="lg:order-1 lg:col-span-4">
        <h2 className={kicker}>{details.kicker}</h2>
        <dl className="mt-8 divide-y divide-line border-y border-line">
          <div className="py-6">
            <dt className={kicker}>{SOCIAL.whatsapp.label}</dt>
            <dd className="mt-3">
              <SiteLink href={SOCIAL.whatsapp.href} className={value}>
                {SOCIAL.whatsapp.display}
              </SiteLink>
            </dd>
            <dd className="mt-2 text-[15px] text-ink-soft">{details.whatsappNote}</dd>
          </div>
          <div className="py-6">
            <dt className={kicker}>{SOCIAL.instagram.label}</dt>
            <dd className="mt-3">
              <SiteLink href={SOCIAL.instagram.href} className={value}>
                {SOCIAL.instagram.handle}
              </SiteLink>
            </dd>
            <dd className="mt-2 text-[15px] text-ink-soft">{details.instagramNote}</dd>
          </div>
          <div className="py-6">
            <dt className={kicker}>{details.locationLabel}</dt>
            <dd className="mt-3 text-[clamp(1.25rem,1.8vw,1.625rem)] leading-[1.15] text-ink">
              {FOOTER.location}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

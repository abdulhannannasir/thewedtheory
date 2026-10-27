# The Wed Theory Events

Website for The Wed Theory, event planning and design in Lahore. Built with Next.js 16 (App Router),
React 19, TypeScript, Tailwind CSS v4 and shadcn/ui.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # lint + typecheck + production build
```

## What is built

- **Front page** (`/`), from the approved design: a full-bleed hero (nav, logo, headline, "Plan Your
  Event" button) over a services strip (intro, Weddings / Social Events / Corporate Events,
  handwritten sign-off). One screen, no footer.
- **Portfolio** (`/portfolio`): intro, five photo tiles (grand entrances, bespoke stages, floral
  architecture, table settings, lighting), a "Close up" masonry gallery of ten details cut from those
  photos, and a closing call to action. The gallery's tiles glide in with GSAP as they scroll into
  view; hovering with a mouse shows each tile's caption, and touch screens always show it.
- **About** (`/about`): intro with an arched photo, our approach, how we work (four steps), what we
  plan, and the closing call to action.

- **Contact** (`/contact`): the ways to reach us (WhatsApp, Instagram, Lahore) and an enquiry form.
  There is no server behind the site, so the form checks the answers and opens WhatsApp with them
  written out as a message. Nothing is stored.

- **Services** (`/services`, and one page each for `/services/weddings`, `birthdays`, `social-events`
  and `corporate-events`): an overview with the four services as photo cards, then a page per service
  with an introduction and arched photo, what we plan, three large highlights, how we work, a masonry
  gallery, the other services, and a call to action that opens WhatsApp (or the enquiry form with the
  event type already chosen: `/contact?service=birthdays`). Each page has its own photographs, title,
  description and share card. Entrances, scroll-reveals, the GSAP gallery and the hover zooms follow
  the rest of the site, and all of it switches off for visitors who prefer reduced motion. The three
  tiles on the front page link to their pages, and "Services" in the header opens the overview.

- **Find your Wed Theory** (`/theory`): a six-question quiz (event, room, light, florals, palette,
  guests) that ends on one of four results (`/theory/candlelit-classic`, `serene-romantic`,
  `garden-in-bloom`, `radiant-evening`). Each result is a static, shareable page with its own palette,
  parts, close-ups and share card, and two ways to act on it: "Plan this on WhatsApp" opens WhatsApp
  with the answers already written out, and the enquiry form opens pre-filled. Four of the questions
  score the result; event type and guest count only go into the message. The quiz is linked from the
  portfolio page, the contact page, the closing call to action and the footer.

- **Search and sharing:** every page has a title, description, canonical link and a share preview card
  (the picture WhatsApp, Instagram and Facebook show for a link), and the site has a `robots.txt`,
  `sitemap.xml`, web app manifest, favicon and app icons, a "ProfessionalService" structured-data
  block on the front page for search engines, and a designed 404 page.

- **Floating Instagram button:** a round button at the bottom right of every page that opens the
  studio's Instagram profile in a new tab (the Instagram app, on a phone that has it). It pops in after
  the opening animation, grows a "Follow us" label for a mouse or the keyboard, keeps clear of phone
  notches, sits under the phone menu and does not print.

- **Opening animation:** the logo reveal video (`public/videos/twt-logo-reveal.mp4`) plays full
  screen the first time someone opens the home page in a browser session, then dissolves into the
  hero while the headline rises in. It starts dissolving at 4.2 seconds, ends early on Skip, a tap or
  click, or Escape, and is skipped for visitors who prefer reduced motion, on reloads and on inner
  pages, with Data Saver on, and on slow (2G or 3G) connections, where its 430 KB is not worth the wait.
  If the video cannot play (autoplay blocked, slow or failed load) it steps aside rather than make
  anyone wait.

All pages are responsive: the nav collapses below 1024px into a full-screen menu, and grids and the
services strip stack. Everything you tap is at least 44px tall, the hero adapts to small phones and
to phones held sideways, and the inner pages share a footer; the front page has none.

## Where things live

| Want to change | Edit |
| --- | --- |
| Any text, link, photo path or the WhatsApp number | `src/components/sites/twt/content.ts` |
| Colours, fonts, animation | `src/app/globals.css`, `src/app/layout.tsx` |
| Opening animation: video, timing, colours, skip label | `INTRO` in `content.ts` (video files in `public/videos/`) |
| Opening animation: logic and the pre-paint check | `intro-splash.tsx`, `intro.ts`; styles at the end of `globals.css` |
| Header and mobile menu | `src/components/sites/twt/site-header.tsx` |
| Hero layout, photo and overlays | `src/components/sites/twt/hero.tsx` |
| Services strip | `src/components/sites/twt/services-strip.tsx` |
| Service icons | `src/components/sites/twt/icons.tsx` |
| Portfolio tiles | `portfolio-grid.tsx` (copy and photos: `PORTFOLIO` in `content.ts`) |
| Portfolio detail gallery | `portfolio-details.tsx` (pictures, captions, order: `PORTFOLIO_DETAILS` in `content.ts`; files in `public/images/details/`) |
| The masonry component itself (layout, GSAP motion, props) | `src/components/ui/masonry-gallery.tsx` |
| About sections | `about-sections.tsx` (copy: `ABOUT` in `content.ts`) |
| Contact page and enquiry form | `contact-section.tsx`, `contact-form.tsx` (copy, labels, options: `CONTACT` in `content.ts`) |
| The services overview and the four service pages: all words, photos, gallery items, calls to action | `src/components/sites/twt/services-content.ts` |
| Service page layout and sections | `service-page.tsx`, `service-sections.tsx`; routes in `src/app/(pages)/services/` |
| Scroll-reveal animation | `src/components/ui/reveal.tsx`, styles under "Scroll reveal" in `globals.css` |
| The floating Instagram button (words and link: `SOCIAL.instagram` in `content.ts`) | `src/components/sites/twt/instagram-button.tsx` |
| Footer, page intro, closing call to action | `site-footer.tsx`, `page-intro.tsx`, `closing-cta.tsx` |
| Quiz questions, answers, scoring weights, the four results (copy, palettes, photos) | `src/components/sites/twt/theory-content.ts` |
| Quiz logic (scoring, address and message building, form pre-fill) | `src/components/sites/twt/theory.ts` |
| Quiz screens and result page | `theory-quiz.tsx`, `theory-result.tsx`, `theory-actions.tsx`, `theme-cards.tsx`, `theory-banner.tsx`; routes in `src/app/(pages)/theory/` |
| Page titles, descriptions and share previews | `src/lib/metadata.ts` (`pageMetadata`), each page's `metadata`; site-wide defaults in `src/app/layout.tsx` |
| Pages listed in the sitemap | `src/app/sitemap.ts` (add a line for any new page) |
| The 404 page | `src/app/not-found.tsx` (copy: `NOT_FOUND` in `content.ts`) |
| Structured data for search engines | `src/components/sites/twt/local-business-schema.tsx` |
| Favicon, app icons, share cards | generated by `scripts/generate-brand-assets.py` (see below) |
| Inner-page routes | `src/app/(pages)/` (the group adds the footer; it is not part of the URL) |

## Phones

The site is built phone-first and measured on a throttled phone (Pixel 7 profile, slow 4G, 4x slower
CPU) as well as at desktop sizes. What keeps it quick on a small screen:

- **Images** are served as AVIF (WebP as the fallback), about 40% smaller than WebP alone
  (`images.formats` in `next.config.ts`), at sizes matched to the screen (`sizes` on every `Image`).
  The first image on a page is loaded first (`preload`); the rest load as they near the screen.
- **Nothing visible at load waits for JavaScript.** Scroll-reveal blocks (`Reveal`) hide only what is
  below the fold; anything on screen at load rises in with a plain CSS animation (`immediate`).
- **Tap targets** are at least 44px tall everywhere, including text links that sit close together.
- **The opening video** is skipped for Data Saver and slow connections (see "Opening animation").
- **Contrast and headings** pass the automated accessibility audit on every page (Lighthouse 100).

When adding images, give them `sizes` (and `preload` if one is the first thing on screen); when adding
blocks to the top of a page, do not wrap them in `Reveal` unless they are below the first screen.

## Service photos

The birthday, social-event and corporate-event pages use stand-in stock photos from Unsplash (free for
commercial use, no attribution required), stored in `public/images/services/<service>/`.
`docs/photo-credits.md` lists each one with its Unsplash page. They are not photos of the studio's own
events, so swap them for real event photography when you have it: replace the files (same names), or
point the paths in `services-content.ts` at new ones and keep each gallery item's `height` matching its
picture's shape (400 is a square). `python3 scripts/fetch-service-photos.py` re-creates the current set.
Re-run `scripts/generate-brand-assets.py` afterwards so the share cards use the new photos.

## Share cards and icons

The favicon (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`), the web app icons
(`public/icons/`) and the share cards (`public/share/`: the site, the quiz, one per quiz result, the
services page and one per service) are
generated, not drawn by hand:

```bash
pip install pillow
python3 scripts/generate-brand-assets.py
```

Run it again whenever the logo, the hero photo, a quiz result's name, tagline, palette or photo, or a
service's name, headline or photo changes (the script has `THEMES` and `SERVICE_CARDS` tables that
mirror `theory-content.ts` and `services-content.ts`, so edit both). It fetches the
free Cormorant Garamond font the first time and refuses to write a card over 280 KB, because WhatsApp
may ignore larger preview images.

## Address, analytics and search

- **Site address.** Share previews, canonical links, `sitemap.xml` and `robots.txt` need the site's full
  address. It is taken from `NEXT_PUBLIC_SITE_URL` if set, otherwise from the production domain Vercel
  gives the project (it follows a custom domain once one is attached), otherwise `localhost`. Set
  `NEXT_PUBLIC_SITE_URL` (for example `https://thewedtheory.com`) in Vercel if the address should not
  follow Vercel's choice.
- **Analytics.** The site includes Vercel Web Analytics (`<Analytics />` in `layout.tsx`). It records
  nothing until it is switched on: in the Vercel dashboard open the project, then Analytics, then Enable.
  Until then its script returns a 404 that visitors never see.
- **Search.** After the site has its final address, add it to Google Search Console and submit
  `/sitemap.xml`. Add a street address to `local-business-schema.tsx` (and claim a Google Business
  Profile) when there is a studio people can visit.

## To do

- To use a different opening video, replace the files in `public/videos/` and update `INTRO` in
  `content.ts`. It should be square with a flat background of one colour (set that colour in
  `INTRO.background`, as a browser shows it) and the logo centred, and small: it is downloaded on the
  first visit. Set `INTRO.fadeAt` to the second where the motion ends. No clip for a hero background
  video has been added; the hero is still a photo.

- The hero photo is a stand-in from the existing photo set. To use the final one, replace
  `public/images/custom-table.jpg` (16:9, 2400 x 1350 px or larger) and `custom-table-mobile.jpg`
  (about 9:16, 1152 x 2064 px or larger), or point `HERO.photo` at new files. Keep the left of the
  photo calm and dark: the headline sits there.
- The portfolio photos, and the close-ups in the "Close up" gallery that are cut from them, are the
  concept images from the earlier site. Swap in real event photography when you have it
  (`PORTFOLIO.items` and `PORTFOLIO_DETAILS.items` in `content.ts`). For the gallery, each
  item's `height` must match its picture's shape (400 is a square; see `MasonryItem`).
- The About copy describes the approach in general terms. Add the founder, a photo and real numbers
  (years, events) when you have them.
- "Enquire" and "Plan Your Event" open WhatsApp directly; "Contact" opens the contact page. Change
  `WHATSAPP` in `content.ts` for a different number.
- To receive enquiries by email or in a CRM instead of WhatsApp, replace the hand-off in `onSubmit`
  in `contact-form.tsx` (it needs a small server route or a form service). The copy and fields can
  stay as they are.

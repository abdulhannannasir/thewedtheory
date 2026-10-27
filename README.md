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
  architecture, table settings, lighting) and a closing call to action.
- **About** (`/about`): intro with an arched photo, our approach, how we work (four steps), what we
  plan, and the closing call to action.

- **Contact** (`/contact`): the ways to reach us (WhatsApp, Instagram, Lahore) and an enquiry form.
  There is no server behind the site, so the form checks the answers and opens WhatsApp with them
  written out as a message. Nothing is stored.

- **Opening animation:** the logo reveal video (`public/videos/twt-logo-reveal.mp4`) plays full
  screen the first time someone opens the home page in a browser session, then dissolves into the
  hero while the headline rises in. It starts dissolving at 4.2 seconds, ends early on Skip, a tap or
  click, or Escape, and is skipped for visitors who prefer reduced motion, on reloads and on inner
  pages. If the video cannot play (autoplay blocked, slow or failed load) it steps aside rather than
  make anyone wait.

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
| About sections | `about-sections.tsx` (copy: `ABOUT` in `content.ts`) |
| Contact page and enquiry form | `contact-section.tsx`, `contact-form.tsx` (copy, labels, options: `CONTACT` in `content.ts`) |
| Footer, page intro, closing call to action | `site-footer.tsx`, `page-intro.tsx`, `closing-cta.tsx` |
| Inner-page routes | `src/app/(pages)/` (the group adds the footer; it is not part of the URL) |

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
- The portfolio photos are the concept images from the earlier site. Swap in real event photography
  when you have it (`PORTFOLIO.items` in `content.ts`).
- The About copy describes the approach in general terms. Add the founder, a photo and real numbers
  (years, events) when you have them.
- "Enquire" and "Plan Your Event" open WhatsApp directly; "Contact" opens the contact page. Change
  `WHATSAPP` in `content.ts` for a different number.
- To receive enquiries by email or in a CRM instead of WhatsApp, replace the hand-off in `onSubmit`
  in `contact-form.tsx` (it needs a small server route or a form service). The copy and fields can
  stay as they are.

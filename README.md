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

All pages are responsive: the nav collapses below 1024px into a full-screen menu, and grids and the
services strip stack. The portfolio and about pages share a footer; the front page has none.

## Where things live

| Want to change | Edit |
| --- | --- |
| Any text, link, photo path or the WhatsApp number | `src/components/sites/twt/content.ts` |
| Colours, fonts, animation | `src/app/globals.css`, `src/app/layout.tsx` |
| Header and mobile menu | `src/components/sites/twt/site-header.tsx` |
| Hero layout, photo and overlays | `src/components/sites/twt/hero.tsx` |
| Services strip | `src/components/sites/twt/services-strip.tsx` |
| Service icons | `src/components/sites/twt/icons.tsx` |
| Portfolio tiles | `portfolio-grid.tsx` (copy and photos: `PORTFOLIO` in `content.ts`) |
| About sections | `about-sections.tsx` (copy: `ABOUT` in `content.ts`) |
| Footer, page intro, closing call to action | `site-footer.tsx`, `page-intro.tsx`, `closing-cta.tsx` |
| Inner-page routes | `src/app/(pages)/` (the group adds the footer; it is not part of the URL) |

## To do

- The hero photo is a stand-in from the existing photo set. To use the final one, replace
  `public/images/custom-table.jpg` (16:9, 2400 x 1350 px or larger) and `custom-table-mobile.jpg`
  (about 9:16, 1152 x 2064 px or larger), or point `HERO.photo` at new files. Keep the left of the
  photo calm and dark: the headline sits there.
- The portfolio photos are the concept images from the earlier site. Swap in real event photography
  when you have it (`PORTFOLIO.items` in `content.ts`).
- The About copy describes the approach in general terms. Add the founder, a photo and real numbers
  (years, events) when you have them.
- "Enquire", "Contact" and "Plan Your Event" open WhatsApp. Change `WHATSAPP` in `content.ts` for a
  different number, or point those links at a contact page once it exists.

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

The front page, from the approved design: a full-bleed hero (nav, logo, headline, "Plan Your Event"
button) over a services strip (intro, Weddings / Social Events / Corporate Events, handwritten
sign-off). It is responsive: the strip and nav collapse below 1024px, and phones get a portrait photo
and a full-screen menu.

## Where things live

| Want to change | Edit |
| --- | --- |
| Any text, link, photo path or the WhatsApp number | `src/components/sites/twt/content.ts` |
| Colours, fonts, animation | `src/app/globals.css`, `src/app/layout.tsx` |
| Header and mobile menu | `src/components/sites/twt/site-header.tsx` |
| Hero layout, photo and overlays | `src/components/sites/twt/hero.tsx` |
| Services strip | `src/components/sites/twt/services-strip.tsx` |
| Service icons | `src/components/sites/twt/icons.tsx` |

## To do

- `Portfolio` (`/portfolio`) and `About` (`/about`) in the nav have no pages yet.
- The hero photo is a stand-in from the existing photo set. To use the final one, replace
  `public/images/custom-table.jpg` (16:9, 2400 x 1350 px or larger) and `custom-table-mobile.jpg`
  (about 9:16, 1152 x 2064 px or larger), or point `HERO.photo` at new files. Keep the left of the
  photo calm and dark: the headline sits there.
- "Enquire", "Contact" and "Plan Your Event" open WhatsApp. Change `WHATSAPP` in `content.ts` for a
  different number, or point those links at a contact page once it exists.

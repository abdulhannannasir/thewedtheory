# The Wed Theory Events

Website for The Wed Theory, event planning and design in Lahore. Built with Next.js 16 (App Router),
React 19, TypeScript, Tailwind CSS v4 and shadcn/ui, with one 3D library (three.js) used only for the
front page's scenes.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (enquiry rules, scroll timeline)
npm run check      # lint + typecheck + tests + production build
npm run build && npm start   # the production build, which is what visitors get
```

Needs Node 22.18 or newer (the tests run TypeScript directly). The first time you run a build, Next fetches the Google fonts, so it needs an
internet connection.

## What is built

- **Front page** (`/`): a short, dark opening animation (once per browser session, with Skip), then a
  scrolling journey: the hero ("The Art of Celebration"), three event environments (a candlelit
  wedding, a daylight social celebration, a cool corporate hall) and a finale. Below it: the three
  service areas, how an enquiry becomes a plan (Discover, Design, Plan, Celebrate), a look at the
  portfolio, and the enquiry form with WhatsApp. See "The front-page journey".
- **Portfolio** (`/portfolio`): intro, five photo tiles (grand entrances, bespoke stages, floral
  architecture, table settings, lighting), then a gallery of every picture on the site with category
  filters and a full-screen viewer, and a closing call to action. Each picture is captioned with its
  kind of event and, honestly, whether it is a concept image or a stock photo (see "Photos").
- **About** (`/about`): intro with an arched photo, our approach, how we work (four steps), what we
  plan, a pile of photographs you can drag aside (see "The card stack"), and the closing call to action.
- **Contact** (`/contact`): the ways to reach us (WhatsApp, Instagram, Lahore) and the enquiry form
  (name, phone, event type, date, venue, guests, budget in PKR, requirements). See "Receiving enquiries".
- **Services** (`/services`, `/services/weddings`, `birthdays`, `social-events`, `corporate-events`):
  an overview and a page per service with its own photographs, highlights, process, gallery and call to
  action (WhatsApp, or the form with the event type already chosen: `/contact?service=birthdays`).
- **Find your Wed Theory** (`/theory`): a six-question quiz that ends on one of four shareable results
  (`/theory/candlelit-classic`, `serene-romantic`, `garden-in-bloom`, `radiant-evening`), each with a
  WhatsApp link and a pre-filled enquiry form.
- **Search and sharing:** every page has a title, description, canonical link and share card;
  `robots.txt`, `sitemap.xml`, web app manifest, favicon and app icons; "ProfessionalService"
  structured data on the front page (no ratings, reviews or invented details); a designed 404 page.
- **Floating Instagram button** on every page; a **skip link** first on every page; a restrained
  **cursor ring and magnetic buttons** for a real mouse only (see "Pointer effects").

All pages are responsive: the nav collapses below 1024px into a full-screen menu; everything you tap has
a 44px touch area; the front page adapts to small phones and to phones held sideways.

## The front-page journey

One piece of markup, two layouts, two renderers. Files: `cinematic-journey.tsx` (markup),
`journey-content.ts` (words, photos, looks), `journey.css` (layouts), `src/lib/journey/` (timeline and
motion), `src/lib/gl/` (the 3D renderer).

**Layouts.** *Plain* is the default: five full-width scenes stacked, each photograph behind its words.
That is what visitors get with reduced motion, with JavaScript off, in print, and if the journey's script
has not started within 10 seconds. *Cinematic* (`<html data-motion="full">`, set before first paint by the
script in `intro.ts`) turns the scenes into one pinned stage inside a tall track. The stage is
`position: sticky`, so the page scrolls natively: nothing hijacks the wheel or a finger.

**Motion.** `src/lib/journey/run-journey.ts` reads how far through the track the visitor is, eases that
into one number, and from it draws everything: `timeline.ts` (pure functions, unit-tested) says which
scene is showing, how far the "doorway" between two scenes has opened, each scene's text opacity and
how far the camera has pushed in. The doorway is the brand's arch. It pauses when the journey is off
screen, and the layered version stops its loop whenever scrolling stops.

**Renderers.** Where the device can run it, `src/lib/gl/venue-renderer.ts` draws each venue as the
photograph plus a *depth map* (white is near): the shader shifts every pixel by an amount that depends on
its depth as the camera pushes in and the pointer moves, so near things slide across far things, with
real 3D drifting light (warm bokeh, petals, cool dust, twinkling sparks) in front. It is a genuine WebGL
scene, not a flat image. Otherwise a layered fallback (the same photographs, the same arch doorways in
CSS) runs. The 3D code is fetched only after the page has loaded and settled, on devices that qualify
(`src/lib/gl/quality.ts`: not Data Saver or 2G/3G, enough memory and cores; three quality tiers for
pixels, particles and picture size). It also steps itself down if frames run slow, and falls back to the
layered scene if the browser loses the GPU. Pictures are decoded off the main thread and uploaded to the
GPU one per frame.

**Try the fallbacks.** Add `?render=css` to the address to see the layered scene, or `?render=gl` to
force 3D (it then never gives up, even on a machine without a GPU, which is slow but lets you look at it).
Turn on "reduce motion" in your system settings, or disable JavaScript, for the plain layout.

**Keyboard and screen readers.** The scenes are real sections with headings and links, in reading order,
so they are read whatever the layout. Tabbing to a button in a scene that is not on screen scrolls that
scene into view. The scene dots (and "Explore Our World") scroll to a scene. The skip link jumps past the
journey to the services.

**Opening animation** (`intro-sequence.tsx`, words in `INTRO` in `content.ts`). Dark room, light gathers
and soft motes rise; an arch of ivory light rises with the logo in it (the logo keeps its own colours
on its own ivory; it is never recoloured or moved), a champagne sheen crosses the arch behind it, the
brand line draws in; then the arch fills with the hero venue and opens until the venue fills the screen,
which is pixel for pixel the page underneath. It starts at first paint using only opacity and transform
(so it keeps playing while the page's scripts load), plays once per browser session, never for reduced
motion, Data Saver or slow connections, has no sound, and ends at once on Skip intro, a click, a tap or
Escape. The old logo-reveal video (`public/videos/`) is no longer used by the site; it is still in the
repository if you want it back.

**Changing a scene.** Words, photographs, crops, colour treatment and light are all in
`journey-content.ts` (a long comment at the top lists the steps). Swapping a photograph needs a new depth
map: add the picture to `PHOTOS` in `scripts/generate-depth-maps.py` and run it (`pip install
onnxruntime numpy pillow`; it downloads a small open depth model the first time and writes
`public/depth/*.webp`).

## Receiving enquiries

The form posts to `/api/enquiry` (`src/app/api/enquiry/route.ts`), which checks everything again on the
server and delivers it to a destination **you configure with environment variables**. Until you do, the
form cannot reach the studio by itself: it says so plainly ("We couldn't send this online. Nothing has
been sent yet") and hands the visitor a ready-made WhatsApp message. It never claims an enquiry was sent
unless a destination accepted it.

**Email to your inbox (recommended).** The site sends each enquiry as an email through
[Resend](https://resend.com) (free: 100 emails a day, 3,000 a month).

1. Sign up at resend.com **with the inbox address that should receive enquiries** and confirm that
   address. (Resend's shared test sender can only deliver to the address the account was created with. To
   send to other addresses, or from your own domain, verify a domain at Resend and set
   `ENQUIRY_EMAIL_FROM`.)
2. In Resend, API Keys, create a key with "Sending access".
3. In Vercel, open the project, Settings, Environment Variables, and add for **Production**:
   `RESEND_API_KEY` (the key; mark it Sensitive) and `ENQUIRY_EMAIL_TO` (the inbox address; several can be
   separated by commas). Optionally `ENQUIRY_EMAIL_FROM`, such as `The Wed Theory <enquiries@yourdomain>`.
   Redeploy. None of these is ever sent to the browser.
4. Send a test enquiry from the live form. If it does not arrive, check the spam folder first, then the
   function logs in Vercel: the route logs the email service's own reason (an unverified sender, a wrong
   key) but never what the visitor wrote.

**Or a webhook.** Set `ENQUIRY_WEBHOOK_URL` to any service that accepts a JSON POST: Formspree (a form's
endpoint URL), Make or Zapier (a catch webhook), n8n or your own CRM (an `https://` URL; for local testing
`http://localhost:...` is allowed). Optionally add `ENQUIRY_WEBHOOK_TOKEN`, sent as
`Authorization: Bearer <token>`. The JSON has every field, plus `phoneDigits` (WhatsApp format),
`whatsappChat` (a `wa.me` link to the visitor), `text` (all answers as plain text), `source`, `pageUrl` and
`receivedAt`.

If both are set, the enquiry is sent both ways and counts as delivered if either accepted it. The route
counts a webhook as having accepted only if it answered 2xx **and** did not answer with a web page or
`{"ok": false}`: some services (a Google Apps Script web app that is not shared, for one) answer 200 with a
page when something is wrong, and the form must then report that nothing was sent.

For local development put the variables in `.env.local` (it is git-ignored). Spam: a hidden field catches
bots and an address that sends many enquiries in ten minutes is slowed down (per server instance: a speed
bump, not a wall).

Business settings that are not secrets are in `src/config/business.ts`: the WhatsApp number (change it
there and every WhatsApp link follows), the event types, the budget ranges in PKR (edit them to suit
the events you usually plan) and the field limits. The words on the form are `CONTACT` in `content.ts`.

## Photos

The studio's portfolio photographs and the stand-in stock photographs are all that the site holds; none
is a photograph of the studio's own events, and the site says so. Each gallery picture carries a
`provenance` (`concept`, `stock` or `studio`) in `portfolio-gallery-data.ts` and the gallery prints it in
the caption ("Concept image", "Stock photo"); set a picture to `studio` and no label is shown. A
`location` is printed only when you set one, so add it only when the venue and the client have agreed to
being named. The service pages and the journey's social and corporate scenes use stock photographs
(credits in `docs/photo-credits.md`).

To swap in real photography: replace the files (same names) or point the paths in `content.ts`,
`services-content.ts`, `journey-content.ts` at new ones; for the journey, also regenerate the depth maps
(above); run `scripts/generate-brand-assets.py` so the share cards use the new photos; keep each masonry
item's `height` matching its picture's shape (400 is a square).

The hero photo is `public/images/custom-table.jpg` (16:9, 2400 x 1350 px or larger) and
`custom-table-mobile.jpg` (about 9:16). Keep the left calm and dark: the headline sits there.

## Where things live

| Want to change | Edit |
| --- | --- |
| The WhatsApp number, event types, budget ranges | `src/config/business.ts` |
| Any other text, link or photo path | `src/components/sites/twt/content.ts` |
| The journey: scene words, photographs, crops, colour treatment, light | `journey-content.ts` |
| The services overview, process steps and portfolio preview (front page) | `home-content.ts` (the wording itself comes from `services-content.ts` and `ABOUT` in `content.ts`) |
| Colours, fonts, animation | `src/app/globals.css`, `src/app/layout.tsx` |
| Journey layouts (plain and cinematic) | `src/app/journey.css` |
| Opening animation: words, colours | `INTRO` in `content.ts`; timings in `intro-sequence.tsx` and `globals.css` ("THE OPENING ANIMATION") |
| 3D look: shaders, light, quality tiers | `src/lib/gl/` |
| Scroll timeline: where each doorway opens, when text fades | `src/lib/journey/timeline.ts` (then `npm test`) |
| Header and mobile menu | `site-header.tsx` |
| Hero words and buttons | `cinematic-hero.tsx` (copy: `HERO` in `content.ts`) |
| Portfolio gallery: pictures, captions, provenance | `portfolio-gallery-data.ts`; layout `portfolio-gallery.tsx`, viewer `portfolio-lightbox.tsx` |
| Portfolio tiles (the five collections) | `portfolio-grid.tsx` (copy and photos: `PORTFOLIO` in `content.ts`) |
| The close-up masonry (service pages) | `portfolio-details.tsx`, `src/components/ui/masonry-gallery.tsx` |
| About sections and the card stack | `about-sections.tsx`, `about-moments.tsx`, `src/components/ui/interactive-card-stack.tsx` |
| Enquiry form and its rules | `enquiry-form.tsx`, `src/lib/enquiry.ts` (shared with the API and the tests), `src/app/api/enquiry/route.ts` |
| The services overview and four service pages | `services-content.ts`, `service-page.tsx`, `service-sections.tsx` |
| Quiz questions, results, logic | `theory-content.ts`, `theory.ts`, `theory-quiz.tsx`, `theory-result.tsx` |
| Scroll-reveal animation | `src/components/ui/reveal.tsx` ("Scroll reveal" in `globals.css`) |
| Cursor ring and magnetic buttons | `src/components/ui/pointer-effects.tsx` (mark a button `data-magnetic`) |
| Floating Instagram button | `instagram-button.tsx` (`SOCIAL.instagram`) |
| Footer, page intro, closing call to action | `site-footer.tsx`, `page-intro.tsx`, `closing-cta.tsx` |
| Page titles, descriptions, share previews | `src/lib/metadata.ts`, each page's `metadata`, `src/app/layout.tsx` |
| Pages in the sitemap | `src/app/sitemap.ts` |
| Structured data for search engines | `local-business-schema.tsx` |
| Favicon, app icons, share cards | `scripts/generate-brand-assets.py` |
| Depth maps for the 3D scenes | `scripts/generate-depth-maps.py` (writes `public/depth/`) |

## Pointer effects

For a real mouse only (never touch, never reduced motion): a thin ring trails the pointer and swells over
anything clickable, and buttons marked `data-magnetic` lean up to 9px toward the pointer. The normal
cursor is never hidden or replaced, the ring ignores clicks and blends with whatever is beneath it, so it
cannot cover text. On touch screens nothing replaces them; essential information never depends on hover
(captions sit under pictures, and touch screens always show them).

## The card stack

`InteractiveCardStack` (`src/components/ui/interactive-card-stack.tsx`) is a pile of cards you drag
aside (or tap, or step through with the keys) to bring the next one forward. It uses `framer-motion`
(11.x); the animation code is loaded after the page, not with it. Size the parent and the pile fills it:

```tsx
<div className="h-[34rem] w-80">
  <InteractiveCardStack cards={[<img key="a" />, <div key="b">Any content</div>]} randomRotation sendToBackOnClick />
</div>
```

| Prop | Default | What it does |
| --- | --- | --- |
| `cards` | `[]` | The cards, any React nodes. The first one starts on top. |
| `randomRotation` | `false` | Tilts each card a little, by its own amount. |
| `sensitivity` | `180` | Pixels a card must be dragged to go to the back. |
| `sendToBackOnClick` | `false` | Clicking or tapping the top card sends it to the back. |
| `autoplay` | `false` | Cycles by itself. Pauses on hover, while keyboard focus is inside, while dragging, while off screen and for reduced motion; shows a pause button. |
| `autoplayDelay` | `3000` | Milliseconds between automatic moves. |
| `pauseOnHover` | `true` | Pause autoplay while a mouse is over the pile. |
| `animationConfig` | `{ stiffness: 260, damping: 20 }` | The spring the cards settle with. |
| `mobileClickOnly` | `false` | On a touch screen, no dragging: a tap cycles. |
| `label` | `"Card stack"` | What a screen reader calls the pile. |
| `showControls` | `true` | The previous / next (and pause) buttons under the pile, in the bottom 44px of the parent. |
| `className`, `cardClassName` | | Classes for the whole component and for each card's frame. |

On a touch screen the cards drag sideways only, so the page can still be scrolled with a finger that
starts on the pile. Cards other than the top one are hidden from screen readers and cannot be focused;
focus the pile and use the arrow keys, Enter or Space.

## Phones

The site is built phone-first and measured on a throttled phone profile (a 412px-wide viewport at 1.75x,
slow 4G, 4x slower CPU) as well as at desktop sizes. What keeps it quick on a small screen:

- **Images** are served as AVIF (WebP as the fallback), at sizes matched to the screen (`sizes` on every
  `Image`). The first image on a page is loaded first; the rest load as they near the screen. The
  journey's later scenes are not even on the page until the visitor is about to reach them.
- **Nothing visible at load waits for JavaScript.** The opening animation's first phase is CSS, scroll
  reveals hide only what is below the fold, and the hero text rises in with a plain CSS animation.
- **The 3D is optional and late.** It loads after the page has settled, only on devices that qualify,
  decodes pictures off the main thread, uploads them one per frame, compiles its shaders without
  freezing the page, draws fewer pixels on phones and steps itself down if frames run slow.
- **Code the page does not need is not shipped to it**: the picture viewer and the quiz pre-fill load
  only when used.
- **Tap targets** are at least 44px everywhere, including text links that sit close together.

When adding images, give them `sizes` (and `loading="eager"` if one is the first thing on screen); when
adding blocks near the top of a page, do not wrap them in `Reveal` unless they are below the first screen.

## Service photos

The birthday, social-event and corporate-event pages use stand-in stock photos from Unsplash (free for
commercial use, no attribution required), stored in `public/images/services/<service>/`.
`docs/photo-credits.md` lists each one with its Unsplash page. They are not photos of the studio's own
events, so swap them for real event photography when you have it. `python3 scripts/fetch-service-photos.py`
re-creates the current set. Re-run `scripts/generate-brand-assets.py` afterwards so the share cards use
the new photos.

## Share cards and icons

The favicon (`src/app/favicon.ico`, `icon.png`, `apple-icon.png`), the web app icons
(`public/icons/`) and the share cards (`public/share/`) are generated, not drawn by hand:

```bash
pip install pillow
python3 scripts/generate-brand-assets.py
```

Run it again whenever the logo, the hero photo, a quiz result's name, tagline, palette or photo, or a
service's name, headline or photo changes (the script has `THEMES` and `SERVICE_CARDS` tables that
mirror `theory-content.ts` and `services-content.ts`, so edit both). It refuses to write a card over
280 KB, because WhatsApp may ignore larger preview images.

## Deploying to Vercel

The project is a standard Next.js app: no `vercel.json` is needed.

- **Preview.** Every push to a branch other than `main` (for example `claude/...`) gets its own preview
  deployment and URL, and the pull request shows it. Preview URLs are behind Vercel sign-in. Nothing
  on a preview touches the live site.
- **Production.** The live site (`thewedtheory.vercel.app`) is the `main` branch. Merging a pull request
  into `main` publishes it. Check the preview first.
- **Environment variables** (Project, Settings, Environment Variables; set them for Production, and for
  Preview if you want previews to deliver enquiries too): `ENQUIRY_WEBHOOK_URL` (and optionally
  `ENQUIRY_WEBHOOK_TOKEN`), see "Receiving enquiries"; `NEXT_PUBLIC_SITE_URL` only if the address should
  not follow Vercel's choice (below).
- **Address.** Share previews, canonical links, `sitemap.xml` and `robots.txt` need the site's full
  address. It is taken from `NEXT_PUBLIC_SITE_URL` if set, otherwise from the production domain Vercel
  gives the project (it follows a custom domain once one is attached), otherwise `localhost`.
- **Analytics.** The site includes Vercel Web Analytics (`<Analytics />` in `layout.tsx`). It records
  nothing until it is switched on: open the project in Vercel, then Analytics, then Enable. Until then
  its script returns a 404 that visitors never see (it shows as a console error in development).
- **Search.** After the site has its final address, add it to Google Search Console and submit
  `/sitemap.xml`. Add a street address to `local-business-schema.tsx` (and claim a Google Business
  Profile) when there is a studio people can visit.

## Testing

`npm test` runs the unit tests in `tests/` with Node's own test runner (no extra dependency): the enquiry
form's rules (phone formats, dates, budget, limits, the WhatsApp message, the delivery payload) and the
scroll timeline (the doorway, text fades and camera push never overlap or run backward). `npm run check`
adds lint, the type check and the production build. Everything visual (the opening animation, the 3D
journey, the layered and plain fallbacks, the form, the gallery, keyboard use) is checked in a real
browser; there is no automated browser suite in the repository.

## To do

- Replace the concept and stock photographs with the studio's own event photography (see "Photos"),
  and set `location` on pictures once it can be named.
- Set `ENQUIRY_WEBHOOK_URL` (see "Receiving enquiries") so the form can deliver enquiries by itself.
- Review the budget ranges in `src/config/business.ts`.
- The About copy describes the approach in general terms. Add the founder, a photo and real numbers
  (years, events) when you have them. No testimonials are shown, because none have been supplied.

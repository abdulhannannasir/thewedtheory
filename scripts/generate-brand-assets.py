#!/usr/bin/env python3
"""
Generates the brand images that cannot come from CSS: the favicon and app icons, and the social
share cards (what WhatsApp, Instagram and Facebook show when a link is shared).

    python3 scripts/generate-brand-assets.py

Needs Pillow (`pip install pillow`) and an internet connection the first time, to fetch the free
Cormorant Garamond font (SIL Open Font License) from Google's font repository. Fonts are used only to
draw these images; nothing from them ships to visitors.

Re-run it whenever the logo, the hero photo, the quiz results' names, taglines, palettes or photos, or
a service's name, headline or photo change. The quiz copy lives in
src/components/sites/twt/theory-content.ts and the service copy in services-content.ts: keep THEMES
and SERVICE_CARDS below in step with them. (The service photos themselves come from
scripts/fetch-service-photos.py.)

Writes:
  src/app/favicon.ico, src/app/icon.png, src/app/apple-icon.png
  public/icons/icon-192.png, icon-512.png, icon-maskable-512.png   (the web app manifest)
  public/share/site.jpg, quiz.jpg, <result>.jpg                    (the share cards: the site, the quiz
                                                                    and each of its four results)
  public/share/services.jpg, service-<slug>.jpg                    (the services page and each service)
"""

import os
import sys
import tempfile
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
APP = ROOT / "src" / "app"

IVORY = (240, 237, 226)
CREAM = (241, 233, 220)
INK = (53, 52, 42)
INK_SOFT = (107, 103, 91)
FOREST = (47, 59, 43)

FONT_URL = (
    "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/"
    "CormorantGaramond%5Bwght%5D.ttf"
)
FONT_ITALIC_URL = (
    "https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/"
    "CormorantGaramond-Italic%5Bwght%5D.ttf"
)

# Keep in step with THEMES in src/components/sites/twt/theory-content.ts.
THEMES = {
    "candlelit-classic": {
        "title": ["The Candlelit", "Classic."],
        "tagline": "Warm, timeless and unhurried.",
        "palette": ["#f3e8d2", "#e3cfa5", "#b48a45", "#3b2b1c"],
        "photo": "images/custom-table.jpg",
        "focus": (0.68, 0.6),
    },
    "serene-romantic": {
        "title": ["The Serene", "Romantic."],
        "tagline": "Soft, airy and effortless.",
        "palette": ["#f4eee2", "#e6dfcf", "#bfc6ae", "#cbc2af"],
        "photo": "images/hero-drapes.jpg",
        "focus": (0.2, 0.45),
    },
    "garden-in-bloom": {
        "title": ["The Garden", "in Bloom."],
        "tagline": "Lush, abundant and alive.",
        "palette": ["#f6f1e6", "#ece3d0", "#93a082", "#5f7260"],
        "photo": "images/floral-architecture.jpg",
        "focus": (0.5, 0.35),
    },
    "radiant-evening": {
        "title": ["The Radiant", "Evening."],
        "tagline": "Grand, glittering and unforgettable.",
        "palette": ["#e6d4aa", "#b8923f", "#f4efe3", "#1f160d"],
        "photo": "images/lighting-ambience.jpg",
        "focus": (0.5, 0.3),
    },
}


# Keep in step with SERVICE_PAGES in src/components/sites/twt/services-content.ts.
SERVICE_CARDS = {
    "weddings": {
        "kicker": "WEDDINGS",
        "title": ["Your day,", "thoughtfully planned."],
        "photo": "images/grand-entrance.jpg",
        "focus": (0.5, 0.55),
    },
    "birthdays": {
        "kicker": "BIRTHDAYS",
        "title": ["Birthdays worth", "the candles."],
        "photo": "images/services/birthdays/hero.jpg",
        "focus": (0.5, 0.4),
    },
    "social-events": {
        "kicker": "SOCIAL EVENTS",
        "title": ["Gatherings,", "beautifully held."],
        "photo": "images/services/social-events/hero.jpg",
        "focus": (0.5, 0.45),
    },
    "corporate-events": {
        "kicker": "CORPORATE EVENTS",
        "title": ["Events that", "reflect your brand."],
        "photo": "images/services/corporate-events/hero.jpg",
        "focus": (0.42, 0.5),
    },
}


def fetch_font(url: str, name: str) -> str:
    path = Path(tempfile.gettempdir()) / name
    if not path.exists():
        print(f"downloading {name} ...")
        urllib.request.urlretrieve(url, path)
    return str(path)


def font(path: str, size: int, weight: int) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(path, size)
    f.set_variation_by_axes([weight])
    return f


def hex_rgb(value: str):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def text_width(draw, text, f, tracking=0.0):
    return sum(draw.textlength(ch, font=f) + tracking for ch in text) - tracking


def draw_tracked(draw, xy, text, f, fill, tracking=0.0):
    """Draws text with letter-spacing (PIL has none of its own)."""
    x, y = xy
    for ch in text:
        draw.text((x, y), ch, font=f, fill=fill)
        x += draw.textlength(ch, font=f) + tracking


def cover(im: Image.Image, size, focus=(0.5, 0.5)) -> Image.Image:
    """Like CSS object-fit: cover with an object-position."""
    tw, th = size
    scale = max(tw / im.width, th / im.height)
    resized = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left = round((resized.width - tw) * focus[0])
    top = round((resized.height - th) * focus[1])
    return resized.crop((left, top, left + tw, top + th))


# ---------------------------------------------------------------------------------------------
# Icons: a cream "W" on deep forest green, the colour of the Enquire button.
# ---------------------------------------------------------------------------------------------
def make_icon(size: int, serif: str, *, rounded=True, glyph_scale=0.66) -> Image.Image:
    scale = 4  # draw big, then shrink, for clean edges at 16px
    s = size * scale
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    radius = round(s * 0.22) if rounded else 0
    d.rounded_rectangle((0, 0, s - 1, s - 1), radius=radius, fill=FOREST + (255,))
    f = font(serif, round(s * glyph_scale), 500)
    box = d.textbbox((0, 0), "W", font=f)
    gw, gh = box[2] - box[0], box[3] - box[1]
    d.text(((s - gw) / 2 - box[0], (s - gh) / 2 - box[1] - s * 0.01), "W", font=f, fill=CREAM)
    return im.resize((size, size), Image.LANCZOS)


def write_icons(serif: str):
    (PUBLIC / "icons").mkdir(parents=True, exist_ok=True)
    base = make_icon(512, serif)
    base.save(APP / "icon.png", optimize=True)
    # iOS draws its own rounded corners, so the apple icon is a full square.
    make_icon(180, serif, rounded=False).convert("RGB").save(APP / "apple-icon.png", optimize=True)
    make_icon(192, serif).save(PUBLIC / "icons" / "icon-192.png", optimize=True)
    base.save(PUBLIC / "icons" / "icon-512.png", optimize=True)
    # Maskable icons are cropped to a circle or squircle by the OS: keep the glyph in the safe zone.
    make_icon(512, serif, rounded=False, glyph_scale=0.5).convert("RGB").save(
        PUBLIC / "icons" / "icon-maskable-512.png", optimize=True
    )
    ico_source = make_icon(256, serif)
    ico_source.save(APP / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])


# ---------------------------------------------------------------------------------------------
# Share cards, 1200 x 630: text on ivory at the left, a photo panel at the right.
# ---------------------------------------------------------------------------------------------
W, H = 1200, 630
PANEL_X = 690


def card_base(photo: str, focus) -> Image.Image:
    im = Image.new("RGB", (W, H), IVORY)
    panel = cover(Image.open(PUBLIC / photo).convert("RGB"), (W - PANEL_X, H), focus)
    im.paste(panel, (PANEL_X, 0))
    return im


def save_card(im: Image.Image, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, quality=84, optimize=True, progressive=True)
    kb = path.stat().st_size / 1024
    print(f"  {path.relative_to(ROOT)}  {kb:.0f} KB")
    if kb > 280:
        sys.exit(f"{path} is over 280 KB; WhatsApp may ignore share images larger than ~300 KB")


def write_site_card(serif: str, serif_italic: str):
    im = card_base("images/custom-table.jpg", (0.68, 0.6))
    d = ImageDraw.Draw(im)
    logo = Image.open(PUBLIC / "images/twt-logo.png").convert("RGBA")
    lw = 520
    logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    im.paste(logo, (72, 138), logo)
    d.text((72, 372), "Thoughtfully planned.", font=font(serif_italic, 40, 400), fill=INK)
    d.text((72, 420), "Beautifully celebrated.", font=font(serif_italic, 40, 400), fill=INK)
    draw_tracked(
        d, (72, 506), "EVENT PLANNING & DESIGN  ·  LAHORE", font(serif, 17, 500), INK_SOFT, 3.6
    )
    save_card(im, PUBLIC / "share" / "site.jpg")


def write_quiz_card(serif: str, serif_italic: str):
    im = card_base("images/hero-drapes.jpg", (0.3, 0.5))
    d = ImageDraw.Draw(im)
    draw_tracked(d, (72, 120), "FIND YOUR WED THEORY", font(serif, 20, 500), INK_SOFT, 4.4)
    d.text((72, 168), "Six questions.", font=font(serif, 92, 400), fill=INK)
    d.text((72, 268), "One theory.", font=font(serif_italic, 96, 400), fill=INK)
    d.text(
        (72, 410),
        "The look, light and florals that fit you.",
        font=font(serif_italic, 34, 400),
        fill=INK_SOFT,
    )
    draw_tracked(d, (72, 540), "THE WED THEORY EVENTS  ·  LAHORE", font(serif, 16, 500), INK_SOFT, 3.6)
    save_card(im, PUBLIC / "share" / "quiz.jpg")


def write_result_cards(serif: str, serif_italic: str):
    for slug, t in THEMES.items():
        im = card_base(t["photo"], t["focus"])
        d = ImageDraw.Draw(im)
        draw_tracked(d, (72, 96), "MY WED THEORY IS", font(serif, 20, 500), INK_SOFT, 4.4)
        d.text((72, 140), t["title"][0], font=font(serif_italic, 96, 400), fill=INK)
        d.text((72, 244), t["title"][1], font=font(serif_italic, 96, 400), fill=INK)
        d.text((72, 372), t["tagline"], font=font(serif, 34, 400), fill=INK_SOFT)
        for i, colour in enumerate(t["palette"]):
            x = 72 + i * 56
            d.ellipse((x, 462, x + 40, 502), fill=hex_rgb(colour), outline=(205, 199, 184), width=2)
        draw_tracked(
            d, (72, 552), "FIND YOURS  ·  THE WED THEORY EVENTS", font(serif, 16, 500), INK_SOFT, 3.6
        )
        save_card(im, PUBLIC / "share" / f"{slug}.jpg")


def fit_italic(draw, text, path, max_width, start=96, weight=400):
    """The largest italic size, from `start` down, at which `text` fits in `max_width`."""
    size = start
    while size > 40:
        f = font(path, size, weight)
        if draw.textlength(text, font=f) <= max_width:
            return f
        size -= 2
    return font(path, 40, weight)


def write_service_cards(serif: str, serif_italic: str):
    text_width = PANEL_X - 72 - 36
    for slug, c in SERVICE_CARDS.items():
        im = card_base(c["photo"], c["focus"])
        d = ImageDraw.Draw(im)
        draw_tracked(d, (72, 96), c["kicker"], font(serif, 20, 500), INK_SOFT, 4.4)
        f1 = fit_italic(d, c["title"][0], serif_italic, text_width, 92)
        f2 = fit_italic(d, c["title"][1], serif_italic, text_width, 92)
        size = min(f1.size, f2.size)
        f = font(serif_italic, size, 400)
        d.text((72, 146), c["title"][0], font=f, fill=INK)
        d.text((72, 146 + round(size * 1.08)), c["title"][1], font=f, fill=INK)
        draw_tracked(
            d, (72, 540), "THE WED THEORY EVENTS  ·  LAHORE", font(serif, 16, 500), INK_SOFT, 3.6
        )
        save_card(im, PUBLIC / "share" / f"service-{slug}.jpg")

    # The services page: all four photographs in a grid.
    im = Image.new("RGB", (W, H), IVORY)
    tile_w, tile_h = (W - PANEL_X) // 2, H // 2
    for i, c in enumerate(SERVICE_CARDS.values()):
        tile = cover(Image.open(PUBLIC / c["photo"]).convert("RGB"), (tile_w, tile_h), c["focus"])
        im.paste(tile, (PANEL_X + (i % 2) * tile_w, (i // 2) * tile_h))
    d = ImageDraw.Draw(im)
    draw_tracked(d, (72, 120), "SERVICES", font(serif, 20, 500), INK_SOFT, 4.4)
    d.text((72, 168), "Every celebration,", font=font(serif, 78, 400), fill=INK)
    d.text((72, 258), "designed with care.", font=font(serif_italic, 78, 400), fill=INK)
    d.text(
        (72, 396),
        "Weddings, birthdays, social events",
        font=font(serif_italic, 32, 400),
        fill=INK_SOFT,
    )
    d.text((72, 436), "and corporate events.", font=font(serif_italic, 32, 400), fill=INK_SOFT)
    draw_tracked(d, (72, 540), "THE WED THEORY EVENTS  ·  LAHORE", font(serif, 16, 500), INK_SOFT, 3.6)
    save_card(im, PUBLIC / "share" / "services.jpg")


def main():
    if not (PUBLIC / "images" / "twt-logo.png").exists():
        sys.exit("run this from the repository (public/images/twt-logo.png not found)")
    serif = fetch_font(FONT_URL, "CormorantGaramond-VF.ttf")
    serif_italic = fetch_font(FONT_ITALIC_URL, "CormorantGaramond-Italic-VF.ttf")
    print("icons")
    write_icons(serif)
    print("share cards")
    write_site_card(serif, serif_italic)
    write_quiz_card(serif, serif_italic)
    write_result_cards(serif, serif_italic)
    write_service_cards(serif, serif_italic)
    print("done")


if __name__ == "__main__":
    os.chdir(ROOT)
    main()

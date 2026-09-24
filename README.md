# Sierra St. Kitchen & Cocktails: rebrand concept

A spec pitch package for a brand refresh of **Sierra St. Kitchen & Cocktails** (50 N. Sierra St., downtown Reno). The brief: *make the vibe match the prices* with a facelift, not a new concept.

> **Concept 01: “Where downtown slows down.”** Same name, same room, same dates. A look and a voice that finally match the check.

This is a speculative design proposal. It is **not** the restaurant's website and is not affiliated with it. Every page carries a “Concept” bar and is set to `noindex`.

## What's in the package

| Page | What it is |
|---|---|
| `index.html` | **Website mockup: homepage.** Animated river-lights hero, live open/closed status in Reno time, reservation prototype, “Tonight” programs, menu preview with hover-to-see plate illustrations, cocktail program, cellar, private events, owners' story, illustrated map, newsletter. |
| `menu.html` | **Website mockup: full menu.** Kitchen, cocktails, wine, beer, Golden Hour. Every dish named, spelled and priced where prices are published. |
| `brand.html` | **Brand board.** Positioning shift, logo suite, color, type, voice (before/after using their real copy), illustration system, in-room applications, photography direction, rollout. |
| `audit.html` | **Online presence audit.** Ten places the current brand is missing the mark, with evidence, confidence labels, fixes and sources. |

Toggle **Pitch notes** in the top bar (or add `?notes=1` to the URL) to overlay annotations that link each design decision to an audit finding.

## Viewing it

- **Easiest:** open anything in `dist/`. Those are self-contained single files that work offline, which suits presenting from a laptop.
- **From source:** `npm run serve`, then open <http://localhost:8080>. Or open `index.html` directly in a browser.
- **Quick look:** full-page renders are in `screenshots/` (desktop 1440px and mobile 390px, plus a notes-on version of the homepage).

## Before you present: placeholders to confirm

- [ ] Replace **“Your Studio”** with your studio name (find/replace across `*.html`).
- [ ] **Hours**: the mockup mirrors sierrastkitchen.com (Sun–Thu 4–9, Fri–Sat 4–midnight). Other platforms disagree; see `docs/research-notes.md`.
- [ ] **Prices**: a dash (—) means no price was published online. Bacon-wrapped dates at $16 comes from Yelp's listing.
- [ ] **Menu gaps**: the “half the menu is unpriced, one dish has no name” finding comes from a crawl. Check it on the live page in a browser.
- [ ] **GF/V marks, capacities (“up to 14”), service-charge wording**: placeholders and recommendations, not current policy.
- [ ] **Proposed programs**: Curtain Call, Cellar Night, River Letter and the tableside Purple Rain pour are proposals.
- [ ] **“395”**: the route-shield treatment assumes it refers to US-395. Ask the bar.
- [ ] **Photography**: the brand board uses illustrated mood frames in place of photos. Real photography is phase 4.

## Project structure

```
index.html · menu.html · brand.html · audit.html
assets/
  css/site.css        design tokens, site components
  css/pitch.css       brand board + audit layouts
  js/site.js          hero canvas, live status, reservation/enquiry prototypes, pitch notes
  js/glasses.js       ten cocktail illustrations (SVG), drawn from real ingredients
  js/plates.js        top-down plate illustrations (SVG)
  fonts/              Cormorant Garamond + Jost (self-hosted, SIL OFL 1.1)
  img/                vector logo suite: wordmarks, roundel, favicon (font-independent)
dist/                 single-file builds (npm run bundle)
screenshots/          renders (npm run shots)
docs/research-notes.md  sources, data snapshot, open questions
scripts/              build-logos.mjs · bundle.mjs · screenshot.mjs
```

## Scripts

```bash
npm install          # dev tooling only (fonts for logo outlines, opentype.js, playwright)
npm run logos        # regenerate assets/img/*.svg from the brand fonts
npm run bundle       # rebuild dist/ single-file pages
npm run shots        # re-render screenshots/ (headless Chromium)
npm run serve        # local preview on :8080
```

## Credits & licensing

- Typefaces: [Cormorant Garamond](https://github.com/CatharsisFonts/Cormorant) and [Jost](https://github.com/indestructible-type/Jost), both SIL Open Font License 1.1, via Fontsource.
- All illustrations, logos, layouts and copy were created for this concept. Review quotes come from public guest reviews and a published wine-list review, with sources in `audit.html`. Confirm permission before any public use.

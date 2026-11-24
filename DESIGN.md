---
name: Vitela
description: Invitaciones digitales para bodas y XV años como cartas de lotería impresas en papelería de lujo.
colors:
  carmin: "#a3262a"
  carmin-deep: "#861b1f"
  on-carmin: "#ffffff"
  foil: "#c9a45c"
  foil-light: "#ead3a0"
  foil-deep: "#9c7a37"
  gold-day: "#9c7a2b"
  gold-day-text: "#7d6020"
  logo-v-day: "#a8842f"
  gold-night-strong: "#dcbd7e"
  azul-tinta: "#1f3a6b"
  verde-botella: "#2f5d46"
  mostaza: "#d9a62e"
  frijol: "#5a2a1c"
  frijol-brillo: "#e9d8c8"
  ivory: "#f5efe4"
  ivory-hi: "#fbf7f0"
  ivory-deep: "#efe7d9"
  ink: "#1a1614"
  ink-soft: "#5c524a"
  night-surface: "#241f1c"
  night-surface-2: "#2d2724"
  night-muted: "#b8afa3"
  seal-night: "#8fa9d8"
  ok-night: "#7cc29b"
  warn-day: "#b98710"
  error-night: "#f08a7e"
typography:
  display:
    fontFamily: "'Bodoni Moda', 'Didot', 'Bodoni 72', Georgia, serif"
    fontSize: "clamp(2.8rem, 5.4vw, 5rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Bodoni Moda', 'Didot', 'Bodoni 72', Georgia, serif"
    fontSize: "clamp(2.1rem, 4.4vw, 3.6rem)"
    fontWeight: 900
    lineHeight: 1.02
    letterSpacing: "-0.015em"
  accent-italic:
    fontFamily: "'Bodoni Moda', 'Didot', 'Bodoni 72', Georgia, serif"
    fontWeight: 600
    lineHeight: 1.12
  title:
    fontFamily: "'Bodoni Moda', 'Didot', 'Bodoni 72', Georgia, serif"
    fontSize: "1.55rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  card-caption:
    fontFamily: "'Bodoni Moda', 'Didot', 'Bodoni 72', Georgia, serif"
    fontSize: "1rem"
    fontWeight: 700
    letterSpacing: "0.08em"
  body:
    fontFamily: "'Hanken Grotesk', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Hanken Grotesk', system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.925rem"
    fontWeight: 600
    lineHeight: 1.45
rounded:
  card: "5px"
  ticket: "6px"
  sm: "8px"
  md: "14px"
  pill: "999px"
spacing:
  gutter: "20px"
  panel-gap: "18px"
  card-pad: "20px"
  band: "clamp(64px, 9vw, 112px)"
components:
  button-primary:
    backgroundColor: "{colors.carmin}"
    textColor: "{colors.on-carmin}"
    typography: "{typography.label}"
    rounded: "{rounded.ticket}"
    padding: "9px 18px"
  button-primary-hover:
    backgroundColor: "{colors.carmin-deep}"
    textColor: "{colors.on-carmin}"
  button-primary-big:
    backgroundColor: "{colors.carmin}"
    textColor: "{colors.on-carmin}"
    rounded: "{rounded.ticket}"
    padding: "14px 26px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.ticket}"
    padding: "9px 18px"
  button-plan:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.ticket}"
    padding: "12px 18px"
  paper-card:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "10px"
  panel-card:
    backgroundColor: "{colors.ivory-hi}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "{colors.ivory-hi}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: Vitela

## Overview

**Creative North Star: "Lotería de gala"**

Vitela is the Mexican lotería executed as luxury stationery. Every feature is a numbered card printed on ivory paper with a thin black edge, a champagne-foil inner frame, a flat-ink drawing and a caption box in Bodoni capitals. The site around the cards is a sheet of the same paper: ivory with a cotton grain by day ("papel de día"), a warm near-black salon by night ("salón de noche"). The story is told "carta por carta" and closes with "¡Lotería!".

The cards are printed objects, so they never change with the theme. Only the page around them changes, and only their shadow adapts (a warm paper shadow by day; a deep shadow plus a faint gold halo edge by night). Collector inks are desaturated: carmín, azul tinta, verde botella, mostaza. Gold appears as foil on cards and as italic Bodoni emphasis in headings; carmín is the one action color in both modes.

Density is generous on the public site (wide bands, big Didone display) and practical in the panel (cards, forms, tables on the same tokens). Cards are set down by hand: each carries a fixed tilt between −2° and 2° derived from its number, and lifts and turns slightly when touched, as if taken from the deck.

**Key Characteristics:**
- Ivory paper with SVG fractal-noise grain on every page band; night mode is a warm brown-black, never pure black.
- Lotería cards drawn in SVG with named inks resolved by CSS, identical in both modes.
- Champagne foil gradient (light, base, light, deep) only on card frames and the logo frame.
- Bodoni Moda for display and card type; Hanken Grotesk for interface text.
- Carmín primary button in both modes; gold reserved for emphasis, foil, focus and selection.
- Hand-placed tilt, deal-in animation, lift on hover; all motion removed under reduced motion.

## Colors

Ivory paper and warm ink, desaturated lotería inks, and champagne foil; two page modes, one card palette.

### Primary
- **Carmín** (carmin): the primary button in both modes, the featured plan card, card accents (bullets, italic caption words), the Lotería template default. White text on it measures 7.3:1.
- **Carmín Hondo** (carmin-deep): primary button hover.

### Secondary
- **Foil Champagne** (foil, foil-light, foil-deep): the card and logo inner frame as a 135° gradient (light → base 45% → light 70% → deep). In night mode `foil` is also the accent text and focus color.
- **Oro de Día** (gold-day): light-mode `--accent`, for large gold italics (hero emphasis, finale "¡Lotería!"), focus outlines, selected borders, meter fills. Deepened from the brief's #A8842F so large italics clear 3:1 on the grained ivory (≈3.3:1).
- **Oro de Texto** (gold-day-text): light-mode `--accent-text` and `--accent-strong` for small gold text: links, verses, countdowns, carousel dot, FAQ plus sign (≈5.1:1).
- **Oro del Logo** (logo-v-day): the V stroke of the logo in light mode; night uses `foil`.

### Tertiary (card inks)
- **Azul Tinta** (azul-tinta), **Verde Botella** (verde-botella), **Mostaza** (mostaza): card grounds and drawing fills. Azul tinta is also the light-mode `--seal` (event date badge); verde is light `--ok`.
- **Frijol** (frijol, frijol-brillo): the bean that marks a "called" card on the tabla.

### Neutral
- **Marfil** (ivory): light `--bg`, card paper, night-mode text.
- **Marfil Alto** (ivory-hi): light `--surface`, plan card face.
- **Marfil Hondo** (ivory-deep): light `--surface-2` (hover fills, quick-send cards).
- **Tinta** (ink): light text, card edges and drawing lines, night `--bg`.
- **Tinta Suave** (ink-soft): light muted text and card secondary text.
- **Salón** (night-surface, night-surface-2): night surfaces.
- **Humo** (night-muted): night muted text.
- Hairlines are ink at 14% (light) or ivory at 10% (night); borders are ink at 85% (light) or ivory at 15% (night).
- Status in night mode lifts to seal-night, ok-night, error-night; light warn text is warn-day.

### Named Rules
**The Printed Object Rule.** Cards (`--card-*`, `--foil-*`) are the same in both modes. A mode may change a card's shadow and halo, never its paper, inks or foil.

**The Two Golds Rule.** In light mode, gold-day is for large italics and non-text marks only; any gold text under ~24px uses gold-day-text. Both modes were validated WCAG AA.

**The One Action Rule.** Carmín is the only solid action color. Gold never fills a button.

## Typography

**Display Font:** Bodoni Moda (with Didot, Bodoni 72, Georgia), self-hosted variable 400–900, roman and italic.
**Body Font:** Hanken Grotesk (with system-ui, Segoe UI, Roboto), self-hosted variable.

**Character:** A high-contrast Didone that reads as engraved stationery and as the printed numbers of a lotería deck, set against a quiet, friendly grotesk for everything a host has to operate.

### Hierarchy
- **Display** (900, clamp(2.8rem, 5.4vw, 5rem), 0.98): hero heading; its emphasized phrase is italic 600 in gold-day.
- **Headline** (900, clamp(2.1rem, 4.4vw, 3.6rem), 1.02, max 18ch, balanced): band titles on the home page.
- **Accent Italic** (italic 600): hero emphasis, finale "¡Lotería!" (900 italic, clamp(3.6rem, 11vw, 6rem)), auth quote, tabla verses (1rem, gold-day-text).
- **Title** (600, 1.55rem h2 / 2.2rem h1 / 1.2rem h3, 1.15): panel headings; page headers 2.4rem, card h2 1.6rem.
- **Card Caption** (700, 1rem, 0.08em, uppercase): card name box; SVG caption steps from 10px down to 8px for long names instead of distorting letters.
- **Body** (400, 16px, 1.6): interface text; leads at 1.1–1.13rem in muted ink, max 46–62ch.
- **Label** (600, 0.925rem): buttons; form labels 500 at 0.875rem.

### Named Rules
**The Didone Numbers Rule.** Card numbers, plan pass counts, prices and dates use Bodoni Moda (700–900); tables and counters in the panel use Hanken with tabular numerals.

## Layout

The public site is a stack of full-bleed bands that alternate page background and surface (both grained), with content held to 1200px by a gutter of `max(20px, (100vw − 1200px)/2 + 20px)`. Band padding is clamp(64px, 9vw, 112px); band heads cap at 62ch. The closing band (finale) renders in the opposite mode via `.invert-scheme`.

Card numbering runs as one deck across the home page: 1–4 hero, 5–10 the tabla of features, 11–14 designs, 15–17 plans. The hero is a two-column grid (copy 0.85fr, deck 1.3fr) that stacks under 980px; the deck becomes a horizontal scroll-snap carousel with the next card peeking, plus dots and a "n / total" counter. Designs carousel under 1100px. The tabla is a 3-column board (2 under 1000px, 1 under 640px) with a 1.5px ink edge and a gold outline offset 5px. Pricing is 3 columns, single column ≤440px wide under 900px.

The panel uses `.page` (max 1040px, wide 1200px, narrow 440px; padding 32px 16px 64px; gap 18px) with a sticky glass topbar. Mobile breakpoint for forms and tables is 600px (tables reflow to cards); editors collapse at 900px.

## Elevation & Depth

Depth comes from paper. Cards cast a layered drop-shadow filter that follows their silhouette; panel surfaces sit on a soft ambient shadow; headers use translucent paper glass. All shadows are soft and blurred, warm brown by day and black by night.

### Shadow Vocabulary
- **Card rest** (`drop-shadow(0 10px 16px rgb(60 40 20 / .12)) drop-shadow(0 2px 3px rgb(60 40 20 / .1))`; night `drop-shadow(0 16px 24px rgb(0 0 0 / .55)) drop-shadow(0 3px 4px rgb(0 0 0 / .35))`): every lotería card and paper card.
- **Card lift** (`drop-shadow(0 22px 26px rgb(60 40 20 / .18)) drop-shadow(0 3px 4px rgb(60 40 20 / .1))`; night deeper): hover/touch state, with translate −8px and tilt −3°.
- **Card halo** (night only, `rgb(201 164 92 / .25)` 1.2px edge): separates ivory cards from the dark salon.
- **Panel small** (`0 1px 2px rgb(60 40 20 / .06), 0 2px 10px rgb(60 40 20 / .05)`): panel cards, Google button.
- **Panel raised** (`0 18px 44px -14px rgb(60 40 20 / .22)`): dialogs, hovered event cards.
- **Glass** (paper at 88% with saturate + blur 12–14px): site header and panel topbar.

### Named Rules
**The Soft Paper Rule.** Shadows are always blurred and warm; there are no hard offset shadows.

## Shapes

Cards have barely rounded corners (5px HTML, rx 4 in SVG) like die-cut stock, with a thin ink edge and a square foil frame inset 4px. Buttons use a printed-ticket corner (6px). Inputs 8px, panel cards and dialogs 14px, chips, badges and icon buttons fully round. Card number and caption boxes are square with 1px ink borders. Bullets are small rotated squares (7px diamonds) in carmín, mostaza or gold.

## Components

### Buttons
- **Shape:** printed-ticket corner (6px).
- **Primary:** carmín with white text, 600 weight, 9px 18px; big variant 14px 26px at 1rem; the home "ticket" variant is 700 with 0.01em tracking.
- **Hover / Focus:** hover darkens to carmín-deep; active nudges down 1px; focus is a 2px gold outline offset 2px.
- **Secondary:** transparent with ink text and border; hover fills surface-2 and mixes gold into the border.
- **Danger:** transparent with error text; solid danger fills error.
- **Link:** no fill, accent-strong, underline on hover. Home text links underline 2px in gold with 6px offset.
- **Plan button:** ink fill with ivory text inside plan cards; on the featured carmín card it inverts to ivory with ink text.

### Chips
- **Style:** transparent, 1px border, pill, 0.85rem.
- **State:** selected fills accent-soft (gold at 14%) with a gold border.

### Cards / Containers
- **Panel card:** surface, 1px border, 14px radius, 20px padding, small shadow, 14px gap.
- **Event card:** hover lifts 2px, gold-mixed border, raised shadow; date badge in azul tinta on seal-soft.
- **Plan options and selection:** selected gets a gold border, inset gold ring and accent-soft fill.

### Inputs / Fields
- **Style:** surface fill, 1px border, 8px radius, 10px 12px padding, 0.95rem.
- **Focus:** gold border plus a 4px accent-soft ring; hover mixes 45% gold into the border.
- **Error / Disabled:** error text in carmín (light) or error-night; disabled at 55% opacity.

### Navigation
- **Site header:** sticky glass with a hairline bottom; nav links muted 0.92rem 500, hover to full text; hidden under 900px. Login link is a text link underlined on hover; the theme toggle is a 38px round icon button whose hover turns gold.
- **Footer:** surface band with grain, hairline dividers, muted links underlined on hover.

### Lotería Card (signature)
SVG at 100 × 150: optional halo edge (night), ivory paper with a 1.1px ink edge (rx 4), a 2px foil gradient frame inset, an 82 × 110 art panel filled with a named ink ground and a hand-drawn flat-ink drawing, a square number box top-left (Bodoni 700) and a caption box (Bodoni 700 caps, 0.08em, stepped 10→8px). Fill and stroke attributes name inks (`tinta`, `papel`, `rojo`, `azul`, `verde`, `mostaza`, `halo`, `logo`) and CSS resolves them to `--card-*`. Tilt is fixed per number (`((n × 37) mod 9 − 4) × 0.5°`). On the home deck cards deal in one by one; the pending "Palomita" prints in ink only and fills with color on confirmation.

### Paper Card (HTML replica)
Same anatomy in HTML for design samples (11–14) and plans (15–17): ivory paper, 1px ink border, 5px radius, foil frame via a gradient border-image inset 4px, number box and caption box, the same tilt, shadow and lift. Plan faces use ivory-hi; the featured plan is carmín with ivory type and mostaza bullets.

### Tabla and Frijol
The features board: cards beside their text, a Bodoni italic verse in gold-day-text, and a frijol that drops onto each card as it is "called" (from −34px, −40°, scale 1.3 to rest at −14°). The finale shows a 2 × 2 full tabla with all beans placed.

### Logo
The official logo files supplied by the owner live in `public/brand/`: `vitela-logo-dark.svg` (ivory lotería card, champagne frame, number "1", gold V over a carmín seal with a heart, "VITELA" caption) is the mark next to the wordmark in Bodoni 800 at 1.6rem (`Logo`/`Mark` in `src/components/brand/Logo.tsx`, rendered as an image, 400 × 520 ratio; a drop shadow lifts it in night mode). `vitela-logo-mono.svg` is the one-ink version used on printed guest lists. `vitela-sello.svg` (the seal alone, square) is the favicon and the large mark on empty states (`Seal`); `vitela-sello-mono.svg` is its one-ink version. Do not redraw or recolor these files in code.

### Theme
The mode lives on `html[data-theme]`, set before paint from `?tema=claro|oscuro` (that visit only), then the saved choice, then the system setting. Changing mode cross-fades background, color and border for 200ms, never under reduced motion.

### Guest Invitation Templates (exception)
Templates under `src/templates` (Clásica, Jardín, Moderna, Lotería) are the host's piece, not Vitela's: they carry their own fonts (Cormorant Garamond, Montserrat, Playfair Display, Bodoni Moda) and read only `--tpl-*` tokens built from the host's colors. The Lotería template turns each section into a numbered card (counter box, 1px text-color edge, inset primary-color frame, ±0.6° alternating tilt) but its colors are still the host's. Panel button hover rules exclude `.tpl` buttons.

**Catalog.** Seven structures (Lotería, Papel picado, Talavera, Art déco, Clásica, Jardín, Moderna) times five variants each make the 35-design catalog in `src/templates/catalog.ts`. A variant is only a palette (primary, background, text) plus a heading font, stored in the invitation config with `variant`; new structures also need their key in the API's `Domain/Templates.cs`. Every variant keeps text on background at 4.5:1 or more and the primary at 3:1 or more (titles are large). Papel picado hangs a flag banner whose cut-outs show the background; Talavera frames the hero with a tile border and dotted tile ground; Art déco uses a sunburst fan, double rules and dark grounds. Showcases render each design as an HTML lotería card (`components/DesignCard.tsx` + `design-card.css`), lazily painted near the viewport; the public catalog lives at `/disenos`, filtered by event type, and the designer offers the same catalog filtered by the event's type.

## Do's and Don'ts

### Do:
- **Do** put every feature, sample and plan on a numbered card and keep the one running deck numbering (1–4, 5–10, 11–14, 15–17).
- **Do** keep cards identical in both modes; adapt only shadow and halo.
- **Do** use gold-day for large italics and marks, gold-day-text for small gold text, logo-v for the logo V.
- **Do** use carmín as the single solid action color in both modes.
- **Do** lay the grain texture on every page band background.
- **Do** give each card its deterministic ±2° tilt and the lift-on-hover; remove motion under reduced motion.
- **Do** resolve SVG inks through named fill/stroke attributes, never hex in the drawing.

### Don't:
- **Don't** use wax seals or envelopes as decoration, motifs or illustrations; the only seal is the one inside the official logo files (the competitor uses seal-and-envelope imagery).
- **Don't** put a kicker or eyebrow line above headings.
- **Don't** use glyph icons (emoji, icon fonts or text symbols as icons); draw SVG or CSS shapes.
- **Don't** use hard offset shadows.
- **Don't** re-tint the cards per mode.
- **Don't** use Vitela brand tokens (`--card-*`, `--accent`, `--primary`, Vitela fonts as brand) inside guest invitation templates; they use only `--tpl-*`.
- **Don't** fill buttons with gold or use light gold-day for small text.

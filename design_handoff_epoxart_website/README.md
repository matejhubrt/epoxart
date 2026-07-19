# Handoff: EpoxArt — Handmade Wood + Epoxy Furniture Website

## Overview
EpoxArt is a Czech artisan business (owner: Jakub Havrlík, based in Čenkov) that makes original furniture and homeware from solid wood and epoxy resin — river tables, cutting boards, clocks, and decorative accessories. This handoff covers a full multi-page marketing + light-commerce website with an interactive "build your own table" configurator.

The site is in **Czech** throughout. All UI copy below is the exact text to ship.

## About the Design Files
The files in this bundle (`EpoxArt.dc.html`, `support.js`, `image-slot.js`) are **design references created in HTML** — a working prototype demonstrating the intended look, layout, copy, and interactions. They are **not production code to copy directly.**

`EpoxArt.dc.html` is authored in a proprietary "Design Component" format (custom `<x-dc>`, `<sc-for>`, `<sc-if>` tags plus a `DCLogic` class driven by `support.js`). **Do not try to run or port this runtime.** Treat it as an executable spec: read the markup for structure/styling and the `Component` class for data and behavior, then **recreate the design in a real codebase using its own patterns.**

**Recommended target stack** (no codebase exists yet): **Astro** (great for a mostly-static furniture showcase) or **Next.js**, with React for the interactive configurator and cart. Styling via Tailwind or CSS Modules — the exact choice is yours; match the design tokens below precisely. The contact and inquiry forms need a real backend (Formspree, Resend, or a serverless function). Deploy to Vercel or Netlify.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, radii, and interactions are all specified. Recreate the UI pixel-for-pixel. The one gap is **imagery**: the prototype uses diagonal-hatch placeholder blocks everywhere a real photo belongs (hero, category tiles, product cards, gallery, about portrait, cart thumbnails). The client must supply real product photos before launch.

---

## Global Layout & Chrome

- **Page shell**: `min-height:100vh`, background `#f4efe6`. Content is a single-page app with client-side "pages" swapped by state (`home`, `products`, `custom`, `about`, `contact`, `cart`). In the real build, prefer **real routes** (`/`, `/produkty`, `/vyroba-na-miru`, `/o-nas`, `/kontakt`, `/kosik`) rather than state-swapped views.
- **Max content width**: `1240px`, centered, with `28px` (or `40px` in nav/footer) horizontal padding.

### Navigation (sticky top)
- `position:sticky; top:0; z-index:50`. Background `rgba(250,247,241,0.86)` with `backdrop-filter:blur(12px)`. Bottom border `1px solid #e6ddcc`.
- Inner row: `max-width:1240px`, padding `18px 40px`, flex space-between, vertically centered.
- **Logo** (left): text "EPOXART", Cormorant Garamond, `25px`, weight 600, `letter-spacing:.14em`, clickable → home.
- **Nav links** (center): flex, `gap:30px`. Items: Úvod, Produkty, Výroba na míru, O nás, Kontakt. Font `13.5px`, `letter-spacing:.03em`. Inactive color `#6b6155`, active `#2b2420`. Active item has a `2px` underline bar in `#1f6e63` (`border-radius:2px`) pinned `-2px` below.
- **Cart** (right): clickable group, `gap:14px`. Item-count text ("`{n}` ks") in `#6b6155` `13px`, then a pill button "Košík" — background `#2b2420`, text `#f4efe6`, padding `9px 20px`, `border-radius:999px`, `13px`, `letter-spacing:.03em`.

### Footer
- Background `#efe8db`, top border `1px solid #e6ddcc`.
- 4-column grid `1.4fr 1fr 1fr 1fr`, `gap:32px`, padding `48px 40px`, text `13px` `#6b6155`.
- Col 1: "EPOXART" (Cormorant, `24px`, `letter-spacing:.12em`, `#2b2420`) + paragraph: "Ruční výroba unikátního nábytku z masivu a epoxidové pryskyřice. Každý kus je originál vytvořený s láskou k řemeslu."
- Col 2 "Menu": Produkty, Výroba na míru, O nás, Kontakt (each navigates).
- Col 3 "Kontakt": `+420 732 861 160`, `info@epoxart.cz`, `Čenkov 163, 262 23`.
- Col 4 "Sledujte nás": Instagram (https://www.instagram.com/epoxart19/), Facebook (https://www.facebook.com/profile.php?id=61573065113314).
- Copyright bar below: "© 2026 EpoxArt. Všechna práva vyhrazena." `12px` `#a2937c`.

---

## Screens / Views

### 1. Úvod (Home)
**Purpose**: Brand-first landing; funnels to Products and the custom configurator.

- **Hero**: full-width rounded card (`height:600px`, `border-radius:26px`, `overflow:hidden`), inside the 1240px container with `28px 28px 0` padding. Background is a diagonal hatch placeholder (`repeating-linear-gradient(45deg,#ece2d0,#ece2d0 13px,#e5dbc7 13px,#e5dbc7 26px)`) overlaid with two radial glows (amber `rgba(185,138,78,.28)` top-right, teal `rgba(31,110,99,.24)` bottom-left). **Replace the hatch with a full-bleed hero photo of a river table.** Centered content, max-width `820px`:
  - Eyebrow: "MASIV · EPOXID · RUČNÍ PRÁCE" — Space Mono `12px`, `letter-spacing:.28em`, color `#a06f37`.
  - H1: "Řemeslo, které / *přežije generace.*" — Cormorant `88px`, weight 500, `line-height:1`. Second line italic, color `#1f6e63`.
  - Paragraph: "Originální nábytek z českého masivu a prémiové pryskyřice. Každý kus je jediný svého druhu." — `17px`, `line-height:1.7`, `#5a5045`, max-width `540px`.
  - Two buttons (flex, `gap:16px`): "PROHLÉDNOUT PRODUKTY" (dark: bg `#2b2420`, text `#f4efe6`) and "VÝROBA NA MÍRU" (outline: `1px solid #2b2420`). Both `padding:17px 34px`, `border-radius:999px`, `13px`, `letter-spacing:.06em`.
- **"Why" strip**: 4-col grid, `gap:16px`. Cards bg `#faf7f1`, `border-radius:20px`, padding `30px 28px`. Each: big Cormorant number (`34px`, `#1f6e63`), bold `14px` title, `13px` `#6b6155` body. Content: `01 Poctivý masiv` / "Jen české dřevo s jasným původem." · `02 Unikátnost` / "Originál, který nikdo jiný nemá." · `03 Odolnost` / "Oleje a pryskyřice na generace." · `04 Na míru` / "Barva, tvar i podnoží dle vás."
- **Kolekce (categories)**: section header row — H2 "Kolekce" (Cormorant `44px`, weight 500) and a "Zobrazit vše →" link (`14px`, `#8a6a4f`). 4-col grid of category tiles, `gap:18px`. Tile: bg `#faf7f1`, `border-radius:22px`, `overflow:hidden`; `300px` hatch image area, then `18px 22px` caption with Cormorant `24px` label + `12px` `#8a6a4f` sub. Tiles: Stoly / "Jídelní & konferenční", Prkénka / "Kuchyňská & servírovací", Hodiny / "Nástěnné z masivu", Doplňky / "Dekorace & drobnosti". Clicking a tile sets that product category and navigates to Products.
- **Custom teaser**: full-width rounded hatch banner (`border-radius:26px`, padding `80px 56px`, centered) with a teal radial glow overlay. Eyebrow "VÝROBA NA MÍRU" (`#1f6e63`), H2 "Navrhněte si kus, který bude jen váš." (Cormorant `54px`), paragraph "Vyberte dřevo, odstín pryskyřice, tvar hrany i podnoží — a my z toho vytvoříme originál.", teal pill button "SPUSTIT KONFIGURÁTOR" (bg `#1f6e63`, text `#f4efe6`).
- **Instagram**: header row — H2 "@epoxart19" (Cormorant `34px`) + link "Sledovat na Instagramu →". 6-col grid of square tiles (`aspect-ratio:1`, `border-radius:16px`, hatch), each links to the Instagram profile. **Replace with a real IG feed or 6 curated photos.**

**Scroll reveal**: cards/sections marked with reveal animation start at `opacity:0; translateY(26px)` and transition to visible (`opacity .8s ease`, `transform .8s ease`, staggered `.06s` steps) when scrolled into view via IntersectionObserver (`threshold:0.12`). Recreate with a simple in-view hook / `IntersectionObserver`.

### 2. Produkty (Products)
**Purpose**: Browse the catalog with category filtering.

- Eyebrow "PRODUKTY" (Space Mono `12px`, `#a06f37`), H1 "Naše produkty" (Cormorant `60px`).
- **Filter chips** (flex-wrap, `gap:10px`): Vše, Stoly, Prkénka, Hodiny, Doplňky. Pill, padding `10px 22px`, `13.5px`. Active = dark (`bg #2b2420`, text `#f4efe6`, border `#2b2420`); inactive = `bg #faf7f1`, text `#2b2420`, border `#e0d7c6`. Filtering is instant client-side.
- **Product grid**: 3-col, `gap:22px`. Card: bg `#faf7f1`, `border-radius:22px`, `overflow:hidden`, flex column. Image area `260px` hatch with a category badge pill top-left (`bg #faf7f1`, `#5a5045`, `11px`). Body padding `20px 22px`: Cormorant `23px` name, `12.5px` `#8a7d6a` description, then a bottom row (pushed down with `margin-top:auto`) with price on the left and an action on the right.
  - Price: `16px` weight 600 `#2b2420`. Items with a price show "`{price}` Kč"; price-less items (tables) show "Cena na dotaz".
  - Action: buyable items → dark "Do košíku" pill (adds to cart); on-request items (tables) → teal-outline "Poptat" pill (border `#1f6e63`, text `#1f6e63`) that navigates to the configurator.
- **Product data** (id, name, category, description, price in Kč — `null` = on request):
  - `t1` Jídelní stůl Vltava · stoly · "River stůl z ořechu, epoxidová řeka na míru." · on request
  - `t2` Konferenční stolek Sázava · stoly · "Masivní dub s tmavou pryskyřicí." · on request
  - `t3` River stůl Berounka · stoly · "Jasan, oceánská modř, ocelové podnoží." · on request
  - `p1` Prkénko Ořech kulaté · prkenka · "Servírovací prkénko z olejovaného ořechu." · 890
  - `p2` Servírovací prkénko Dub · prkenka · "Masivní dub s úchopem, potravinový olej." · 1290
  - `p3` Prkénko s epoxidovou řekou · prkenka · "Dřevo a modrá pryskyřice, každý kus originál." · 1650
  - `h1` Nástěnné hodiny Kruh · hodiny · "Kruhové hodiny z masivu s pryskyřicí." · 2490
  - `h2` Hodiny Měsíc epoxid · hodiny · "Tichý strojek, matný povrch." · 3200
  - `d1` Svícen z masivu · doplnky · "Dřevěný svícen s epoxidovým detailem." · 690
  - `d2` Podtácky (sada 4) · doplnky · "Sada čtyř podtácků, dřevo + pryskyřice." · 790
  - `d3` Dekorativní miska · doplnky · "Ruční miska z ořechu a čiré pryskyřice." · 1100
  - `d4` Klíčenka epoxid · doplnky · "Drobný dárek z odřezků a pryskyřice." · 350
  - Category labels: `stoly`→Stoly, `prkenka`→Prkénka, `hodiny`→Hodiny, `doplnky`→Doplňky.

### 3. Výroba na míru (Configurator) — the centerpiece
**Purpose**: Let a customer build a custom river table and submit a non-binding inquiry.

- Eyebrow "VÝROBA NA MÍRU", H1 "Konfigurátor stolu" (Cormorant `60px`), intro paragraph: "Sestavte si vlastní kus. Vyberte dřevo, odstín pryskyřice, tvar a směr řeky — náhled se mění podle vás. Na závěr nám pošlete nezávaznou poptávku."
- **Layout**: 2-col grid `1fr 0.9fr`, `gap:36px`, `align-items:start`.
- **Left — live 3D preview** (sticky, `top:100px`): panel bg `#ece2d0`, `border-radius:26px`, padding `56px 40px`, min-height `460px`, centered. Below it, a Space Mono `11px` `#8a7d6a` summary line.
  - The preview is a **CSS-3D rendered table** that updates live as options change. Build it with CSS `perspective`/`transform`, not images. Structure:
    - **Scene**: `width:420px; height:340px; perspective:1300px; perspective-origin:50% 34%`.
    - **Floor shadow**: radial-gradient ellipse, blurred (`blur(9px)`), under the table.
    - **Table group**: `transform-style:preserve-3d; transform:rotateX(53deg) rotateZ(-2deg); transition:all .5s ease`. Size depends on shape — rectangular/oval `300×172`, square/round `210×210`.
    - **Underside** (slab thickness): same footprint, `translateZ(-16px)`, darker wood gradient.
    - **Top surface**: rounded to the shape radius, `overflow:hidden`, layered wood-grain gradients (fine + coarse repeating-linear-gradients tinted from the wood color) with inset highlight/shadow for a glossy finish.
    - **Resin river** (inside the top, clipped): organic blob (`border-radius:40% 60% 45% 55% / 50%`) with a translucent glossy gradient built from the resin color (light/mid/dark stops + white streaks), inner shadow + outer glow. Its position/rotation depends on the river direction (see below). `transition:all .5s ease`.
    - **Gloss overlay**: full-surface `linear-gradient(115deg, rgba(255,255,255,.22), transparent 42%)`.
  - **Shape → top radius**: Obdélník `14px`, Oválné `150px / 110px`, Čtverec `14px`, Kulaté `50%`.
  - **River direction → position**: Podél (lengthwise, vertical strip ~22% wide, center), Napříč (crosswise horizontal band), Diagonálně (rotated ~31° and scaled), U kraje (narrow strip offset toward one edge). Exact values in `renderVals()` `riverPos` map — copy them.
  - **Wood colors**: Ořech `#5a3a22`, Dub `#b08850`, Jasan `#c9ab78`, Bříza `#ddc79c`.
  - **Resin colors**: Oceánská modř `#1c5c78`, Smaragd `#1f6e63`, Jantar `#c88a3a`, Uhlová čerň `#17140f`, Čirá `#d8c7a2`.
  - A `shade(hex, amt, alpha)` helper lightens/darkens the base color by an RGB offset — port it as-is; it drives all the grain/river gradient stops.
- **Right — controls** (flex column, `gap:28px`). Each group has a `12px` `letter-spacing:.18em` `#8a6a4f` label:
  - **DŘEVO**: swatch chips (flex-wrap). Chip = pill with a `16px` color dot + label, `9px 15px`, `13px`. Selected chip bg `#efe8db` border `#2b2420`; unselected bg `#faf7f1` border `#e0d7c6`.
  - **ODSTÍN PRYSKYŘICE**: same swatch-chip style, 5 resin options.
  - **TVAR**: text pills (dark-active chip style), 4 shapes: Obdélník, Oválné, Čtverec, Kulaté.
  - **SMĚR ŘEKY**: text pills, 4 directions: Podél, Napříč, Diagonálně, U kraje.
  - **ROZMĚR NA MÍRU**: free-text input, placeholder "např. 200 × 100 × 4 cm", bg `#fff`, border `1px solid #e0d7c6`, `border-radius:12px`, padding `13px 16px`. Helper text below (`12px` `#8a7d6a`): "Zadejte délku × šířku (případně tloušťku). Rádi vyrobíme přesně na míru."
  - **Inquiry form** (card bg `#faf7f1`, `border-radius:22px`, padding `28px`): heading "Nezávazná poptávka" (Cormorant `26px`), sub "Ozveme se s cenovou nabídkou na míru vaší konfiguraci." Fields: Jméno, E-mail, textarea "Poznámka (rozměr, termín, inspirace…)". Submit "ODESLAT POPTÁVKU" (teal `#1f6e63`). On submit, replace the form with a success panel (bg `#e6f0ec`, text `#1f6e63`): "Děkujeme! Vaše poptávka byla odeslána — brzy se vám ozveme." **The submitted inquiry must include the current configuration** (wood, resin, shape, river direction, size) — wire this to a real email/backend.
  - **Summary line** (under preview): two lines — "`{wood}` · `{resin}` · řeka `{river}`" and "`{shape}` · `{size or 'rozměr neuveden'}`".
- Defaults: wood Ořech, resin Oceánská modř, shape Obdélník, river Podél, size empty.

### 4. O nás (About)
**Purpose**: Brand story + process.

- Two-col hero (`1fr 1fr`, `gap:48px`, centered): left = eyebrow "O NÁS", H1 "Poctivé řemeslo z dílny v Čenkově." (Cormorant `58px`, `line-height:1.04`), two paragraphs:
  - "V EpoxArt tvoříme originální designové produkty z masivního dřeva a epoxidové pryskyřice. Každý kus — ať už jde o stůl, prkénko, hodiny nebo dekoraci — je ručně vyrobený a jedinečný."
  - "Spojujeme surovou přírodu s moderním designem. Používáme jen české dřevo s jasným původem a prémiové pryskyřice, které vydrží generace."
  - Right = `480px` hatch placeholder "[ portrét · dílna / Jakub ]" — **replace with a workshop/owner portrait.**
- **Process**: 4-col grid of `#faf7f1` cards (radius `20px`, padding `30px 26px`) — Cormorant `38px` `#1f6e63` number, `15px` bold title, `13px` `#6b6155` body: `01 Výběr dřeva` / "Vybíráme kvalitní český masiv s výrazným charakterem." · `02 Zalití pryskyřicí` / "Ruční míchání odstínů a pečlivé lití bez bublin." · `03 Broušení` / "Postupné broušení do hedvábně hladkého povrchu." · `04 Finální olej` / "Ochranné oleje, které povrch chrání na generace."
- **CTA**: centered H2 "Máte nápad? Pojďme ho vyrobit." (Cormorant `40px`) + dark pill "VÝROBA NA MÍRU" → configurator.

### 5. Kontakt (Contact)
**Purpose**: Contact details + message form.

- Eyebrow "KONTAKT", H1 "Ozvěte se nám" (Cormorant `60px`).
- 2-col grid `0.85fr 1.15fr`, `gap:40px`, `align-items:start`.
- **Left — info cards** (`#faf7f1`, radius `20px`, padding `26px`, flex column `gap:22px`), each with a `12px` `letter-spacing:.14em` `#8a6a4f` label:
  - TELEFON: `+420 732 861 160`, `+420 721 157 990`
  - E-MAIL: `info@epoxart.cz`
  - SÍDLO: "Jakub Havrlík / EpoxArt / Čenkov 163, 262 23 / IČO: 23052431"
  - Social row: two pill links (Instagram, Facebook), `flex:1` each, bg `#faf7f1`, radius `14px`.
- **Right — form card** (`#faf7f1`, radius `22px`, padding `34px`): heading "Napište nám" (Cormorant `30px`). Fields: Jméno + E-mail (2-col grid), Předmět (full), textarea "Vaše zpráva" (5 rows). Submit "ODESLAT ZPRÁVU" (teal). On submit, replace with success panel: "Děkujeme za zprávu! Ozveme se vám co nejdříve." **Wire to a real backend.**

### 6. Košík (Cart)
**Purpose**: Review items and check out.

- Eyebrow "KOŠÍK", H1 "Váš košík" (Cormorant `60px`).
- **Empty state**: `#faf7f1` panel, radius `22px`, padding `64px 40px`, centered — "Košík je zatím prázdný", sub "Prohlédněte si naše produkty nebo si nechte vyrobit kus na míru.", two buttons (dark "PROHLÉDNOUT PRODUKTY", outline "VÝROBA NA MÍRU").
- **With items**: 2-col grid `1.5fr 0.85fr`, `gap:30px`.
  - **Line items** (flex column, `gap:16px`): each row = `#faf7f1` card, radius `20px`, padding `18px`, flex row — `104px` square hatch thumb, name (Cormorant `22px`) + unit price ("`{price}` / ks"), a quantity stepper (pill with − / qty / +, bg `#fff`, border `#e0d7c6`, circular `30px` buttons), line total (`110px`, right-aligned, `16px` weight 600), and a `×` remove control (`#b08575`). Below: "← Pokračovat v nákupu" link → Products.
  - **Summary** (sticky `top:100px`, `#faf7f1`, radius `22px`, padding `30px`): "Souhrn objednávky" (Cormorant `28px`); rows Mezisoučet / Doprava; free-shipping hint chip when subtotal is 1–2499 Kč: "Do dopravy zdarma zbývá `{remaining}`." (bg `#efe8db`, `#8a6a4f`); divider; Celkem row (label + Cormorant `24px` total); "POKRAČOVAT K OBJEDNÁVCE" teal button; trust line "Bezpečná platba · Ruční výroba · Doručení 5–10 dní".
  - **Shipping rule**: 149 Kč, free at subtotal ≥ 2500 Kč.

---

## Interactions & Behavior
- **Navigation**: nav links, logo, footer links, and in-page CTAs switch pages; every navigation scrolls to top (`window.scrollTo({top:0, behavior:'smooth'})`). Use real routing in production.
- **Category filter** (Products): instant client-side filter; the chip clicked becomes active.
- **Home category tiles**: set the target category, then go to Products.
- **Add to cart**: buyable products increment a quantity map keyed by product id.
- **Cart stepper**: +/− adjusts quantity; dropping to 0 (or `×`) removes the line.
- **Configurator**: every control updates config state, which re-renders the CSS-3D preview and the summary line live. Shape changes the footprint size + corner radius; river direction repositions the resin blob; both animate via `.5s` transitions.
- **Forms**: inquiry + contact forms flip to an inline success panel on submit (prototype has no validation/backend). In production add required-field validation and POST to a backend; the inquiry payload must carry the full configuration.
- **Scroll reveal**: fade-up on home cards/sections via IntersectionObserver, staggered.
- **Hover states**: links `#1f6e63` → `#17544c` on hover; inputs/textarea focus border `#1f6e63`. Add tasteful hover feedback on cards/buttons to match (subtle lift/darken) — the prototype leans on cursor:pointer only.

## State Management
- `page` — current view (replace with router).
- `cat` — active product category filter (`vse` | `stoly` | `prkenka` | `hodiny` | `doplnky`).
- `cart` — map of `productId → quantity`; derive count, line totals, subtotal, shipping, grand total.
- `cfg` — configurator: `{ wood, resin, shape, size, river }`.
- `inquirySent`, `contactSent` — form success flags.

## Design Tokens

**Colors**
- Page bg: `#f4efe6`
- Surface / card: `#faf7f1`
- Warm surface (hero hatch base, panels): `#ece2d0`; secondary hatch `#e5dbc7`
- Footer / hint bg: `#efe8db`
- Ink (primary text): `#2b2420`
- Body text: `#5a5045`; muted `#6b6155`; faint `#8a7d6a`; faintest `#a2937c`
- Amber accent (eyebrows): `#a06f37`; secondary brown link `#8a6a4f`
- Teal accent (primary brand action): `#1f6e63`; hover `#17544c`; teal wash bg `#e6f0ec`
- Borders: `#e6ddcc` (chrome), `#e0d7c6` (inputs/chips)
- Remove/danger: `#b08575`
- Selection: `#d8c9b0`
- Wood swatches: Ořech `#5a3a22`, Dub `#b08850`, Jasan `#c9ab78`, Bříza `#ddc79c`
- Resin swatches: Oceánská modř `#1c5c78`, Smaragd `#1f6e63`, Jantar `#c88a3a`, Uhlová čerň `#17140f`, Čirá `#d8c7a2`

**Typography**
- Display / headings: **Cormorant Garamond** (400/500/600, plus italic 400/500). Weight 500 for most headings.
- UI / body: **Space Grotesk** (300–700).
- Mono / eyebrows / labels: **Space Mono**.
- Heading scale (Cormorant): H1 `60px` (hero `88px`), section H2 `40–54px`, "Kolekce" `44px`, card titles `22–26px`, numbers `34–38px`.
- Body `15–17px`, line-height `1.7–1.8`. Small labels `11–13.5px`. Eyebrows: `12px`, `letter-spacing:.18–.28em`, uppercase.

**Spacing / radius / shadow**
- Container max `1240px`, gutters `28px` (content) / `40px` (chrome).
- Radii: pills `999px`; large cards/panels `20–26px`; inputs/chips `12–14px`; small `2px` underline.
- Section vertical rhythm ~`44–64px`.
- Shadows are subtle; the only pronounced shadow is the configurator floor shadow (radial gradient + `blur(9px)`).
- Transitions: reveal `0.8s ease`; configurator `0.5s ease`.

## Assets
- **All imagery is placeholder** (diagonal hatch + `[ label ]` captions). Nothing to copy — the client provides real photos:
  - Hero river-table photo (full-bleed, ~1180×600).
  - 4 category tiles (Stoly, Prkénka, Hodiny, Doplňky).
  - 12 product photos (see product list).
  - About: owner/workshop portrait (~portrait, 480px tall).
  - Instagram: 6 square photos or a live feed embed from @epoxart19.
  - Cart thumbnails reuse product photos.
- **Fonts**: Google Fonts — Cormorant Garamond, Space Grotesk, Space Mono.
- **`image-slot.js`** in this bundle is a drag-and-drop placeholder web component used by the prototype only — not needed in production; use real `<img>`/`next/image`/`astro:assets`.
- **Real business data** (ship as-is): phones `+420 732 861 160`, `+420 721 157 990`; email `info@epoxart.cz`; address `Čenkov 163, 262 23`; `IČO: 23052431`; owner `Jakub Havrlík`; Instagram `https://www.instagram.com/epoxart19/`; Facebook `https://www.facebook.com/profile.php?id=61573065113314`.

## Files
- `EpoxArt.dc.html` — the full prototype (markup = layout/styling spec; the `Component` class at the bottom = data + all behavior, incl. the CSS-3D configurator math). **Primary reference.**
- `image-slot.js` — placeholder image-drop web component (prototype only).
- `support.js` — the Design Component runtime. **Reference only — do not port.**

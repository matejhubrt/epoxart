import { CATEGORY_KEYS, type CategoryKey, type Product } from "./products";

export interface SiteTexts {
  heroEyebrow: string;
  heroTitle1: string;
  heroTitle2: string;
  heroText: string;
  customTitle: string;
  customText: string;
  collectionsTitle: string;
  subStoly: string;
  subPrkenka: string;
  subKuchyne: string;
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
  aboutCtaTitle: string;
  productsTitle: string;
  contactTitle: string;
  configTitle: string;
  configText: string;
  galleryTitle: string;
  galleryText: string;
  footerText: string;
  phone1: string;
  phone2: string;
  email: string;
  owner: string;
  address: string;
  ico: string;
  instagram: string;
  facebook: string;
}

export interface SiteImages {
  hero: string | null;
  about: string | null;
  categories: Record<CategoryKey, string | null>;
  /** always 6 entries */
  instagram: (string | null)[];
}

export interface ShippingSettings {
  cost: number;
  freeFrom: number;
}

export interface ColorOption {
  label: string;
  color: string;
}

export interface ConfiguratorSettings {
  woods: ColorOption[];
  resins: ColorOption[];
}

export interface CategorySettings {
  /** categories the owner switched off: hidden from the shop, filters and home page */
  hidden: CategoryKey[];
}

/** One "window" (card) with a heading and a short text; its number is just its position. */
export interface InfoCard {
  title: string;
  body: string;
}

export interface BlocksSettings {
  /** the cards under the hero on the home page */
  why: InfoCard[];
  /** the production steps on the "O nás" page */
  process: InfoCard[];
}

export const MAX_CARDS = 8;

export interface GallerySettings {
  /** public URLs of the photos on the gallery page, in display order */
  photos: string[];
}

export const MAX_GALLERY_PHOTOS = 60;

export interface SiteContent {
  texts: SiteTexts;
  images: SiteImages;
  shipping: ShippingSettings;
  configurator: ConfiguratorSettings;
  categories: CategorySettings;
  blocks: BlocksSettings;
  gallery: GallerySettings;
}

export interface SiteData {
  products: Product[];
  content: SiteContent;
}

export const INSTAGRAM_SLOTS = 6;

export const DEFAULT_CONTENT: SiteContent = {
  texts: {
    heroEyebrow: "MASIV · EPOXID · RUČNÍ PRÁCE",
    heroTitle1: "Řemeslo, které",
    heroTitle2: "přežije generace.",
    heroText:
      "Originální nábytek z českého masivu a prémiové pryskyřice. Každý kus je jediný svého druhu.",
    customTitle: "Navrhněte si kus, který bude jen váš.",
    customText:
      "Vyberte dřevo, odstín pryskyřice, tvar hrany i podnoží — a my z toho vytvoříme originál.",
    collectionsTitle: "Co vyrábíme",
    subStoly: "Jídelní & konferenční",
    subPrkenka: "Kuchyňská & servírovací",
    subKuchyne: "Z laminátových desek",
    aboutCtaTitle: "Máte nápad? Pojďme ho vyrobit.",
    productsTitle: "Naše produkty",
    contactTitle: "Ozvěte se nám",
    galleryTitle: "Galerie",
    galleryText: "Výběr z naší dílny — stoly, prkénka a další kousky, které jsme ručně vyrobili.",
    configTitle: "Konfigurátor stolu",
    configText:
      "Sestavte si vlastní kus. Vyberte dřevo, odstín pryskyřice, tvar a směr řeky — náhled se mění podle vás. Na závěr nám pošlete nezávaznou poptávku.",
    aboutTitle: "Poctivé řemeslo z dílny v Čenkově.",
    aboutP1:
      "V EpoxArt tvoříme originální designové produkty z masivního dřeva a epoxidové pryskyřice. Každý kus — ať už jde o stůl, prkénko, hodiny nebo dekoraci — je ručně vyrobený a jedinečný.",
    aboutP2:
      "Spojujeme surovou přírodu s moderním designem. Používáme jen české dřevo s jasným původem a prémiové pryskyřice, které vydrží generace.",
    footerText:
      "Ruční výroba unikátního nábytku z masivu a epoxidové pryskyřice. Každý kus je originál vytvořený s láskou k řemeslu.",
    phone1: "+420 732 861 160",
    phone2: "+420 721 157 990",
    email: "info@epoxart.cz",
    owner: "Jakub Havrlík",
    address: "Čenkov 163, 262 23",
    ico: "23052431",
    instagram: "https://www.instagram.com/epoxart19/",
    facebook: "https://www.facebook.com/profile.php?id=61573065113314",
  },
  images: {
    hero: null,
    about: null,
    categories: { stoly: null, prkenka: null, kuchyne: null, hodiny: null, doplnky: null },
    instagram: Array.from({ length: INSTAGRAM_SLOTS }, () => null),
  },
  shipping: { cost: 149, freeFrom: 2500 },
  categories: { hidden: [] },
  gallery: { photos: [] },
  blocks: {
    why: [
      { title: "Poctivý masiv", body: "Jen české dřevo s jasným původem." },
      { title: "Unikátnost", body: "Originál, který nikdo jiný nemá." },
      { title: "Odolnost", body: "Oleje a pryskyřice na generace." },
      { title: "Na míru", body: "Barva, tvar i podnoží dle vás." },
    ],
    process: [
      { title: "Výběr dřeva", body: "Vybíráme kvalitní český masiv s výrazným charakterem." },
      { title: "Zalití pryskyřicí", body: "Ruční míchání odstínů a pečlivé lití bez bublin." },
      { title: "Broušení", body: "Postupné broušení do hedvábně hladkého povrchu." },
      { title: "Finální olej", body: "Ochranné oleje, které povrch chrání na generace." },
    ],
  },
  configurator: {
    woods: [
      { label: "Ořech", color: "#5a3a22" },
      { label: "Dub", color: "#b08850" },
      { label: "Jasan", color: "#c9ab78" },
      { label: "Bříza", color: "#ddc79c" },
    ],
    resins: [
      { label: "Oceánská modř", color: "#1c5c78" },
      { label: "Smaragd", color: "#1f6e63" },
      { label: "Jantar", color: "#c88a3a" },
      { label: "Uhlová čerň", color: "#17140f" },
      { label: "Čirá", color: "#d8c7a2" },
    ],
  },
};

const HEX = /^#[0-9a-fA-F]{6}$/;

function cleanColors(input: unknown, fallback: ColorOption[]): ColorOption[] {
  if (!Array.isArray(input)) return fallback;
  const valid = input.filter(
    (o): o is ColorOption =>
      !!o && typeof o.label === "string" && o.label.trim() !== "" && HEX.test(o.color)
  );
  return valid.length > 0 ? valid : fallback;
}

/** A saved list wins even when it is empty (the owner may delete every card); junk falls back. */
function cleanCards(input: unknown, fallback: InfoCard[]): InfoCard[] {
  if (!Array.isArray(input)) return fallback;
  return input
    .filter((c): c is InfoCard => !!c && typeof c.title === "string" && typeof c.body === "string")
    .map((c) => ({ title: c.title.slice(0, 80), body: c.body.slice(0, 300) }))
    .slice(0, MAX_CARDS);
}

function asString(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback;
}

function asUrl(v: unknown): string | null {
  return typeof v === "string" && v.trim() !== "" ? v : null;
}

/** Combine the `site_settings` rows with the defaults; unknown/invalid values fall back safely. */
export function mergeContent(rows: { key: string; value: unknown }[]): SiteContent {
  const byKey = new Map(rows.map((r) => [r.key, r.value as Record<string, unknown> | null]));
  const d = DEFAULT_CONTENT;

  const t = byKey.get("texts") ?? {};
  const texts = { ...d.texts };
  for (const k of Object.keys(texts) as (keyof SiteTexts)[]) {
    texts[k] = asString(t?.[k], d.texts[k]);
  }

  const i = (byKey.get("images") ?? {}) as Partial<Record<keyof SiteImages, unknown>>;
  const cats = (i.categories ?? {}) as Record<string, unknown>;
  const insta = Array.isArray(i.instagram) ? i.instagram : [];
  const images: SiteImages = {
    hero: asUrl(i.hero),
    about: asUrl(i.about),
    categories: {
      stoly: asUrl(cats.stoly),
      prkenka: asUrl(cats.prkenka),
      kuchyne: asUrl(cats.kuchyne),
      hodiny: asUrl(cats.hodiny),
      doplnky: asUrl(cats.doplnky),
    },
    instagram: Array.from({ length: INSTAGRAM_SLOTS }, (_, n) => asUrl(insta[n])),
  };

  const s = byKey.get("shipping") ?? {};
  const shipping: ShippingSettings = {
    cost: asNumber(s?.cost, d.shipping.cost),
    freeFrom: asNumber(s?.freeFrom, d.shipping.freeFrom),
  };

  const c = byKey.get("configurator") ?? {};
  const configurator: ConfiguratorSettings = {
    woods: cleanColors(c?.woods, d.configurator.woods),
    resins: cleanColors(c?.resins, d.configurator.resins),
  };

  const cat = byKey.get("categories") ?? {};
  const hiddenRaw = Array.isArray(cat?.hidden) ? (cat.hidden as unknown[]) : [];
  const categories: CategorySettings = {
    hidden: CATEGORY_KEYS.filter((k) => hiddenRaw.includes(k)),
  };

  const b = byKey.get("blocks") ?? {};
  const blocks: BlocksSettings = {
    why: cleanCards(b?.why, d.blocks.why),
    process: cleanCards(b?.process, d.blocks.process),
  };

  const g = byKey.get("gallery") ?? {};
  const gallery: GallerySettings = {
    photos: (Array.isArray(g?.photos) ? (g.photos as unknown[]) : [])
      .filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u))
      .slice(0, MAX_GALLERY_PHOTOS),
  };

  return { texts, images, shipping, configurator, categories, blocks, gallery };
}

/** Database row -> the shape the UI uses. */
export function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id: String(r.id),
    slug: "", // filled in by assignSlugs once the whole list is known
    name: String(r.name ?? ""),
    cat: r.category as CategoryKey,
    desc: String(r.description ?? ""),
    price: typeof r.price === "number" ? r.price : null,
    image: asUrl(r.image_url),
  };
}

export function phoneHref(phone: string): string {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

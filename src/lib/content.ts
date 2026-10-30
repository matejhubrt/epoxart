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
  kitchenTitle: string;
  kitchenText: string;
  kitchenGalleryTitle: string;
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

/** The woods the configurator has rendered pictures for (public/konfigurator/<shape>-<id>-<river>.webp). */
export const WOOD_IDS = ["dub", "buk", "jasan", "orech"] as const;
export type WoodId = (typeof WOOD_IDS)[number];
export const WOOD_LABELS: Record<WoodId, string> = { dub: "Dub", buk: "Buk", jasan: "Jasan", orech: "Ořech" };
/** swatch colour of each wood as it looks oiled */
export const WOOD_SWATCHES: Record<WoodId, string> = { dub: "#c08a50", buk: "#cfa27a", jasan: "#d8b98d", orech: "#6a4a36" };

/**
 * What the "Naše dřeva" section under the configurator says about each wood. The owner edits it
 * in the admin; anything not saved there falls back to these defaults.
 */
export interface WoodInfo {
  latin: string;
  description: string;
  color: string;
  grain: string;
  /** 1–5 */
  hardness: number;
  bestFor: string;
  /** the owner's own photo; null = the bundled sample photo (public/drevo/<id>.jpg) */
  photo: string | null;
}
export const DEFAULT_WOOD_INFO: Record<WoodId, WoodInfo> = {
  dub: {
    latin: "Quercus robur",
    description:
      "Tvrdé a odolné dřevo s výraznou kresbou a viditelnými póry. Olej mu dodá teplý medový tón. Klasika na jídelní stoly, které vydrží generace.",
    color: "medová až zlatohnědá",
    grain: "výrazná, s lesklými paprsky",
    hardness: 4,
    bestFor: "jídelní a pracovní stoly",
    photo: null,
  },
  buk: {
    latin: "Fagus sylvatica",
    description:
      "Jemné a rovnoměrné dřevo s drobnými tmavšími tečkami. Teplý narůžovělý tón, velmi pevné. Působí klidně a hodí se do moderních interiérů.",
    color: "světlá, narůžovělá",
    grain: "jemná a klidná",
    hardness: 4,
    bestFor: "stoly do moderního a světlého interiéru",
    photo: null,
  },
  jasan: {
    latin: "Fraxinus excelsior",
    description:
      "Světlé, pružné a houževnaté dřevo s výraznými plamennými oblouky letokruhů. Oblíbené ve skandinávském stylu.",
    color: "krémová až světle hnědá",
    grain: "výrazné plamenné oblouky",
    hardness: 4,
    bestFor: "světlé interiéry, výrazná kresba",
    photo: null,
  },
  orech: {
    latin: "Juglans regia",
    description:
      "Ušlechtilé tmavé dřevo s čokoládovými tóny a vlnitou kresbou. Měkčí než dub, ale stabilní. S kontrastní pryskyřicí vypadá luxusně.",
    color: "čokoládová, tmavě hnědá",
    grain: "vlnitá a živá",
    hardness: 3,
    bestFor: "reprezentativní a konferenční stoly",
    photo: null,
  },
};

/** The bundled sample photos are Achim Raschka's (Wikimedia Commons, CC BY-SA 3.0) and must be credited. */
export const WOOD_PHOTO_SOURCE: Record<WoodId, string> = {
  dub: "Wood_Quercus_robur.jpg",
  buk: "Wood_Fagus_silvatica.jpg",
  jasan: "Wood_Fraxinus_excelsior.jpg",
  orech: "Wood_juglans_regia.jpg",
};

/** Text length limits for the wood descriptions (also used by the admin inputs). */
export const WOOD_TEXT_LIMITS = { latin: 60, description: 600, color: 80, grain: 80, bestFor: 120 } as const;

/** A resin pigment. With `shine` it is metallic (mica): it shimmers from `color` to `shine`. */
export interface Pigment {
  label: string;
  color: string;
  shine: string | null;
}

export interface ConfiguratorSettings {
  /** woods the owner switched off */
  hiddenWoods: WoodId[];
  pigments: Pigment[];
  woodInfo: Record<WoodId, WoodInfo>;
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
  /** finished kitchens shown on the kitchen page */
  kitchens: GallerySettings;
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
    kitchenTitle: "Kuchyně na zakázku",
    kitchenText:
      "Každou kuchyň vyrábíme na míru vašemu prostoru i vkusu, z laminátových desek v dekorech podle vašeho přání. Prohlédněte si hotové realizace, nechte se inspirovat a napište nám, co si představujete.",
    kitchenGalleryTitle: "Naše hotové kuchyně",
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
  kitchens: { photos: [] },
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
    hiddenWoods: [],
    // Metallic: Eye Candy pearl pigments, colours measured from the pigment in resin.
    // Opaque: DIPON epoxy pastes, by RAL code.
    pigments: [
      { label: "Kin Gold", color: "#ba7f32", shine: "#ecc36b" },
      { label: "Rose Gold", color: "#d98a7e", shine: "#fcdfc5" },
      { label: "Shu Copper", color: "#7d2721", shine: "#ce6962" },
      { label: "Amaterasu Silver", color: "#727177", shine: "#c9c8ce" },
      { label: "Samurai Black", color: "#28262e", shine: "#616067" },
      { label: "Akoya White", color: "#c3bebd", shine: "#e6e3e3" },
      { label: "Okinawa Blue", color: "#0777a6", shine: "#4eadcb" },
      { label: "Ocean Blue", color: "#064f9f", shine: "#2a85c7" },
      { label: "Emerald Green", color: "#0a6a4a", shine: "#449277" },
      { label: "Akai Tsuki Red", color: "#67100b", shine: "#ab322a" },
      { label: "Murasaki Violet", color: "#301b35", shine: "#704c7d" },
      { label: "Černá RAL 9005", color: "#0e0e10", shine: null },
      { label: "Bílá RAL 9003", color: "#ecece7", shine: null },
      { label: "Grafitová RAL 7024", color: "#474a50", shine: null },
      { label: "Světle šedá RAL 7035", color: "#cbd0cc", shine: null },
      { label: "Azurová RAL 5009", color: "#2e5978", shine: null },
      { label: "Smaragdová RAL 6001", color: "#28713e", shine: null },
      { label: "Signální červená RAL 3001", color: "#a72920", shine: null },
      { label: "Řepková žlutá RAL 1021", color: "#f6b600", shine: null },
    ],
    woodInfo: DEFAULT_WOOD_INFO,
  },
};

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Saved pigments live under `pigments`; the older `resins` colour list is no longer used. */
function cleanPigments(input: unknown, fallback: Pigment[]): Pigment[] {
  if (!Array.isArray(input)) return fallback;
  const valid = input
    .filter(
      (o): o is Pigment =>
        !!o && typeof o.label === "string" && o.label.trim() !== "" && HEX.test(o.color)
    )
    .map((o) => ({ label: o.label, color: o.color, shine: HEX.test(o.shine ?? "") ? o.shine : null }));
  return valid.length > 0 ? valid : fallback;
}

/** Per wood and per field: a saved text wins unless it is blank; anything else keeps the default. */
function cleanWoodInfo(input: unknown): Record<WoodId, WoodInfo> {
  const saved = (input && typeof input === "object" ? input : {}) as Record<string, Record<string, unknown> | undefined>;
  const text = (v: unknown, fallback: string, max: number) =>
    typeof v === "string" && v.trim() !== "" ? v.trim().slice(0, max) : fallback;
  const out = {} as Record<WoodId, WoodInfo>;
  for (const w of WOOD_IDS) {
    const s = saved[w] ?? {}, d = DEFAULT_WOOD_INFO[w], L = WOOD_TEXT_LIMITS;
    const hardness = Number(s.hardness);
    out[w] = {
      latin: text(s.latin, d.latin, L.latin),
      description: text(s.description, d.description, L.description),
      color: text(s.color, d.color, L.color),
      grain: text(s.grain, d.grain, L.grain),
      hardness: Number.isInteger(hardness) && hardness >= 1 && hardness <= 5 ? hardness : d.hardness,
      bestFor: text(s.bestFor, d.bestFor, L.bestFor),
      // only an absolute http(s) address can be a photo (what the upload returns)
      photo: ((p) => (p && /^https?:\/\//.test(p) ? p : null))(asUrl(s.photo)),
    };
  }
  return out;
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
  const hiddenWoodsRaw = Array.isArray(c?.hiddenWoods) ? (c.hiddenWoods as unknown[]) : [];
  const hiddenWoods = WOOD_IDS.filter((w) => hiddenWoodsRaw.includes(w));
  const configurator: ConfiguratorSettings = {
    // at least one wood stays visible
    hiddenWoods: hiddenWoods.length < WOOD_IDS.length ? hiddenWoods : [],
    pigments: cleanPigments(c?.pigments, d.configurator.pigments),
    woodInfo: cleanWoodInfo(c?.woodInfo),
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

  const k = byKey.get("kitchens") ?? {};
  const kitchens: GallerySettings = {
    photos: (Array.isArray(k?.photos) ? (k.photos as unknown[]) : [])
      .filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u))
      .slice(0, MAX_GALLERY_PHOTOS),
  };

  return { texts, images, shipping, configurator, categories, blocks, gallery, kitchens };
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

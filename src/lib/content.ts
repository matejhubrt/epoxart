import type { CategoryKey, Product } from "./products";

export interface SiteTexts {
  heroEyebrow: string;
  heroTitle1: string;
  heroTitle2: string;
  heroText: string;
  customTitle: string;
  customText: string;
  aboutTitle: string;
  aboutP1: string;
  aboutP2: string;
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

export interface SiteContent {
  texts: SiteTexts;
  images: SiteImages;
  shipping: ShippingSettings;
  configurator: ConfiguratorSettings;
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
    categories: { stoly: null, prkenka: null, hodiny: null, doplnky: null },
    instagram: Array.from({ length: INSTAGRAM_SLOTS }, () => null),
  },
  shipping: { cost: 149, freeFrom: 2500 },
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

  return { texts, images, shipping, configurator };
}

/** Database row -> the shape the UI uses. */
export function rowToProduct(r: Record<string, unknown>): Product {
  return {
    id: String(r.id),
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

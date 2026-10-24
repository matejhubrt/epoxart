export type CategoryKey = "stoly" | "prkenka" | "kuchyne" | "hodiny" | "doplnky";

export interface Product {
  id: string;
  /** readable address of the detail page (/produkty/<slug>), unique across the shop */
  slug: string;
  name: string;
  cat: CategoryKey;
  desc: string;
  /** price in Kč, null = on request (poptávka) */
  price: number | null;
  /** public URL of the product photo, null = placeholder */
  image: string | null;
}

export const CATEGORY_KEYS: CategoryKey[] = ["stoly", "prkenka", "kuchyne", "hodiny", "doplnky"];

/** The categories shown as tiles on the home page ("Co vyrábíme"). */
export const HOME_CATEGORY_KEYS: CategoryKey[] = ["stoly", "prkenka", "kuchyne"];

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  stoly: "Stoly",
  prkenka: "Prkénka",
  kuchyne: "Kuchyňské linky",
  hodiny: "Hodiny",
  doplnky: "Doplňky",
};

/** Large furniture is delivered by the maker in person; everything else is shipped as a parcel. */
export const PERSONAL_DELIVERY_CATEGORIES: CategoryKey[] = ["stoly", "kuchyne"];

/** Address of a category's page; kitchens are all custom work, so they have their own page. */
export function categoryHref(cat: CategoryKey): string {
  return cat === "kuchyne" ? "/produkty/kuchyne" : `/produkty?kat=${cat}`;
}

export function isPersonalDelivery(cat: CategoryKey): boolean {
  return PERSONAL_DELIVERY_CATEGORIES.includes(cat);
}

/** "Jídelní stůl Vltava" -> "jidelni-stul-vltava" */
export function slugify(name: string): string {
  const s = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip the accents split off by NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "produkt";
}

/** Gives every product a unique slug; a clash gets "-2", "-3"… in list order. */
export function assignSlugs<T extends { name: string; slug?: string }>(items: T[]): (T & { slug: string })[] {
  const used = new Map<string, number>();
  return items.map((p) => {
    const base = slugify(p.name);
    const n = (used.get(base) ?? 0) + 1;
    used.set(base, n);
    return { ...p, slug: n === 1 ? base : `${base}-${n}` };
  });
}

/** Shown only while the database is unreachable / not configured yet. */
const RAW_DEFAULT_PRODUCTS: Omit<Product, "slug">[] = [
  { id: "t1", name: "Jídelní stůl Vltava", cat: "stoly", desc: "River stůl z ořechu, epoxidová řeka na míru.", price: null, image: null },
  { id: "t2", name: "Konferenční stolek Sázava", cat: "stoly", desc: "Masivní dub s tmavou pryskyřicí.", price: null, image: null },
  { id: "t3", name: "River stůl Berounka", cat: "stoly", desc: "Jasan, oceánská modř, ocelové podnoží.", price: null, image: null },
  { id: "p1", name: "Prkénko Ořech kulaté", cat: "prkenka", desc: "Servírovací prkénko z olejovaného ořechu.", price: 890, image: null },
  { id: "p2", name: "Servírovací prkénko Dub", cat: "prkenka", desc: "Masivní dub s úchopem, potravinový olej.", price: 1290, image: null },
  { id: "p3", name: "Prkénko s epoxidovou řekou", cat: "prkenka", desc: "Dřevo a modrá pryskyřice, každý kus originál.", price: 1650, image: null },
  { id: "h1", name: "Nástěnné hodiny Kruh", cat: "hodiny", desc: "Kruhové hodiny z masivu s pryskyřicí.", price: 2490, image: null },
  { id: "h2", name: "Hodiny Měsíc epoxid", cat: "hodiny", desc: "Tichý strojek, matný povrch.", price: 3200, image: null },
  { id: "d1", name: "Svícen z masivu", cat: "doplnky", desc: "Dřevěný svícen s epoxidovým detailem.", price: 690, image: null },
  { id: "d2", name: "Podtácky (sada 4)", cat: "doplnky", desc: "Sada čtyř podtácků, dřevo + pryskyřice.", price: 790, image: null },
  { id: "d3", name: "Dekorativní miska", cat: "doplnky", desc: "Ruční miska z ořechu a čiré pryskyřice.", price: 1100, image: null },
  { id: "d4", name: "Klíčenka epoxid", cat: "doplnky", desc: "Drobný dárek z odřezků a pryskyřice.", price: 350, image: null },
];

export const DEFAULT_PRODUCTS: Product[] = assignSlugs(RAW_DEFAULT_PRODUCTS);

export function formatKc(n: number): string {
  return `${n.toLocaleString("cs-CZ")} Kč`;
}

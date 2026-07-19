export type CategoryKey = "stoly" | "prkenka" | "hodiny" | "doplnky";

export interface Product {
  id: string;
  name: string;
  cat: CategoryKey;
  desc: string;
  /** price in Kč, null = on request (poptávka) */
  price: number | null;
}

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  stoly: "Stoly",
  prkenka: "Prkénka",
  hodiny: "Hodiny",
  doplnky: "Doplňky",
};

export const PRODUCTS: Product[] = [
  { id: "t1", name: "Jídelní stůl Vltava", cat: "stoly", desc: "River stůl z ořechu, epoxidová řeka na míru.", price: null },
  { id: "t2", name: "Konferenční stolek Sázava", cat: "stoly", desc: "Masivní dub s tmavou pryskyřicí.", price: null },
  { id: "t3", name: "River stůl Berounka", cat: "stoly", desc: "Jasan, oceánská modř, ocelové podnoží.", price: null },
  { id: "p1", name: "Prkénko Ořech kulaté", cat: "prkenka", desc: "Servírovací prkénko z olejovaného ořechu.", price: 890 },
  { id: "p2", name: "Servírovací prkénko Dub", cat: "prkenka", desc: "Masivní dub s úchopem, potravinový olej.", price: 1290 },
  { id: "p3", name: "Prkénko s epoxidovou řekou", cat: "prkenka", desc: "Dřevo a modrá pryskyřice, každý kus originál.", price: 1650 },
  { id: "h1", name: "Nástěnné hodiny Kruh", cat: "hodiny", desc: "Kruhové hodiny z masivu s pryskyřicí.", price: 2490 },
  { id: "h2", name: "Hodiny Měsíc epoxid", cat: "hodiny", desc: "Tichý strojek, matný povrch.", price: 3200 },
  { id: "d1", name: "Svícen z masivu", cat: "doplnky", desc: "Dřevěný svícen s epoxidovým detailem.", price: 690 },
  { id: "d2", name: "Podtácky (sada 4)", cat: "doplnky", desc: "Sada čtyř podtácků, dřevo + pryskyřice.", price: 790 },
  { id: "d3", name: "Dekorativní miska", cat: "doplnky", desc: "Ruční miska z ořechu a čiré pryskyřice.", price: 1100 },
  { id: "d4", name: "Klíčenka epoxid", cat: "doplnky", desc: "Drobný dárek z odřezků a pryskyřice.", price: 350 },
];

export function productById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function formatKc(n: number): string {
  return `${n.toLocaleString("cs-CZ")} Kč`;
}

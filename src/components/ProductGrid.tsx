import { useMemo, useState } from "react";
import { CATEGORY_KEYS, CATEGORY_LABELS, formatKc, type CategoryKey, type Product } from "../lib/products";
import { addToCart } from "../lib/cart";

type CatFilter = "vse" | CategoryKey;

const CHIPS: { key: CatFilter; label: string }[] = [
  { key: "vse", label: "Vše" },
  ...CATEGORY_KEYS.map((key) => ({ key, label: CATEGORY_LABELS[key] })),
];

export default function ProductGrid({
  products: all,
  categories,
  initialCat = "vse",
}: {
  products: Product[];
  /** categories that are switched on; the others get no filter chip */
  categories: CategoryKey[];
  initialCat?: CatFilter;
}) {
  const [cat, setCat] = useState<CatFilter>(initialCat);
  const chips = CHIPS.filter((c) => c.key === "vse" || categories.includes(c.key));
  const [added, setAdded] = useState<string | null>(null);

  const products = useMemo(
    () => all.filter((p) => cat === "vse" || p.cat === cat),
    [all, cat]
  );

  function handleAdd(id: string) {
    addToCart(id);
    setAdded(id);
    window.setTimeout(() => setAdded((cur) => (cur === id ? null : cur)), 1200);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {chips.map((c) => {
          const active = cat === c.key;
          const chipClass = `rounded-full border px-[22px] py-2.5 text-[13.5px] transition-colors ${
            active
              ? "border-ink bg-ink text-page"
              : "border-border-2 bg-surface text-ink hover:border-ink"
          }`;
          // kitchens are all custom work: their own page with gallery and inquiry
          if (c.key === "kuchyne") {
            return (
              <a key={c.key} href="/produkty/kuchyne" className={chipClass}>
                {c.label}
              </a>
            );
          }
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setCat(c.key)}
              className={`rounded-full border px-[22px] py-2.5 text-[13.5px] transition-colors ${
                active
                  ? "border-ink bg-ink text-page"
                  : "border-border-2 bg-surface text-ink hover:border-ink"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="card-in mt-10 rounded-[26px] bg-surface px-8 py-14 text-center sm:px-14">
          <p className="font-mono text-xs tracking-[0.28em] text-amber">PŘIPRAVUJEME</p>
          <h2 className="mt-4 font-display text-[34px] font-medium leading-tight sm:text-[42px]">
            {cat === "vse" ? "Nabídku právě připravujeme" : "Tuto kolekci právě připravujeme"}
          </h2>
          <p className="mx-auto mt-4 max-w-[520px] text-[15px] leading-relaxed text-body">
            Nové kousky z naší dílny přibudou již brzy. Mezitím si můžete navrhnout vlastní
            stůl v konfigurátoru, nebo nám napište a rádi vám poradíme.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="/vyroba-na-miru"
              className="btn-press rounded-full bg-teal px-8 py-3.5 text-[13px] tracking-[0.06em] text-page hover:bg-teal-hover"
            >
              NAVRHNOUT VLASTNÍ STŮL
            </a>
            <a
              href="/kontakt"
              className="btn-press rounded-full border border-ink px-8 py-3.5 text-[13px] tracking-[0.06em] text-ink hover:bg-ink hover:text-page"
            >
              NAPSAT NÁM
            </a>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p, i) => (
          <div
            key={`${cat}-${p.id}`}
            className="card-lift card-in flex flex-col overflow-hidden rounded-[22px] bg-surface"
            style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}
          >
            <a
              href={`/produkty/${p.slug}`}
              aria-label={`Detail produktu ${p.name}`}
              className={`img-zoom relative block h-[260px] overflow-hidden ${p.image ? "bg-warm" : "hatch"}`}
            >
              {p.image && (
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              )}
              <span className="absolute left-3 top-3 rounded-full bg-surface px-2.5 py-1 text-[11px] text-body">
                {CATEGORY_LABELS[p.cat]}
              </span>
            </a>
            <div className="flex flex-1 flex-col px-[22px] py-5">
              <h3 className="font-display text-[23px] leading-tight">
                <a href={`/produkty/${p.slug}`} className="hover:text-teal">
                  {p.name}
                </a>
              </h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-faint">{p.desc}</p>
              <a
                href={`/produkty/${p.slug}`}
                className="mt-2 text-[12.5px] text-brown-link underline-offset-2 hover:text-teal hover:underline"
              >
                Zobrazit detail →
              </a>
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-base font-semibold">
                  {p.price === null ? "Cena na dotaz" : formatKc(p.price)}
                </span>
                {p.price === null ? (
                  <a
                    href={`/produkty/${p.slug}`}
                    className="btn-press rounded-full border border-teal px-5 py-2 text-[13px] text-teal transition-colors hover:bg-teal hover:text-page"
                  >
                    Poptat
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAdd(p.id)}
                    className="btn-press rounded-full bg-ink px-5 py-2 text-[13px] text-page transition-opacity hover:opacity-90"
                  >
                    {added === p.id ? "Přidáno ✓" : "Do košíku"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {cat === "stoly" && (
        <div className="card-in mt-10 flex flex-col items-start justify-between gap-6 rounded-[26px] bg-surface px-8 py-9 sm:flex-row sm:items-center sm:px-12">
          <div>
            <h2 className="font-display text-[30px] font-medium leading-tight sm:text-[36px]">
              Nenašli jste svůj stůl?
            </h2>
            <p className="mt-2 max-w-[520px] text-[15px] leading-relaxed text-body">
              Navrhněte si vlastní: vyberte dřevo, odstín pryskyřice, tvar i rozměr a pošlete nám
              nezávaznou poptávku.
            </p>
          </div>
          <a
            href="/vyroba-na-miru"
            className="btn-press shrink-0 rounded-full bg-teal px-8 py-4 text-[13px] tracking-[0.06em] text-page hover:bg-teal-hover"
          >
            OTEVŘÍT KONFIGURÁTOR
          </a>
        </div>
      )}
    </div>
  );
}

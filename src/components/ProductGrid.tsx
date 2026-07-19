import { useMemo, useState } from "react";
import { CATEGORY_LABELS, PRODUCTS, formatKc, type CategoryKey } from "../lib/products";
import { addToCart } from "../lib/cart";

type CatFilter = "vse" | CategoryKey;

const CHIPS: { key: CatFilter; label: string }[] = [
  { key: "vse", label: "Vše" },
  { key: "stoly", label: "Stoly" },
  { key: "prkenka", label: "Prkénka" },
  { key: "hodiny", label: "Hodiny" },
  { key: "doplnky", label: "Doplňky" },
];

export default function ProductGrid({ initialCat = "vse" }: { initialCat?: CatFilter }) {
  const [cat, setCat] = useState<CatFilter>(initialCat);
  const [added, setAdded] = useState<string | null>(null);

  const products = useMemo(
    () => PRODUCTS.filter((p) => cat === "vse" || p.cat === cat),
    [cat]
  );

  function handleAdd(id: string) {
    addToCart(id);
    setAdded(id);
    window.setTimeout(() => setAdded((cur) => (cur === id ? null : cur)), 1200);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {CHIPS.map((c) => {
          const active = cat === c.key;
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

      <div className="mt-8 grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="flex flex-col overflow-hidden rounded-[22px] bg-surface">
            <div className="hatch relative h-[260px]">
              <span className="absolute left-3 top-3 rounded-full bg-surface px-2.5 py-1 text-[11px] text-body">
                {CATEGORY_LABELS[p.cat]}
              </span>
            </div>
            <div className="flex flex-1 flex-col px-[22px] py-5">
              <h3 className="font-display text-[23px]">{p.name}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-faint">{p.desc}</p>
              <div className="mt-auto flex items-center justify-between pt-5">
                <span className="text-base font-semibold">
                  {p.price === null ? "Cena na dotaz" : formatKc(p.price)}
                </span>
                {p.price === null ? (
                  <a
                    href="/vyroba-na-miru"
                    className="rounded-full border border-teal px-5 py-2 text-[13px] text-teal transition-colors hover:bg-teal hover:text-page"
                  >
                    Poptat
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAdd(p.id)}
                    className="rounded-full bg-ink px-5 py-2 text-[13px] text-page transition-opacity hover:opacity-90"
                  >
                    {added === p.id ? "Přidáno ✓" : "Do košíku"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

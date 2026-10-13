import { useState } from "react";
import { addToCart } from "../lib/cart";

/** Buy / ask buttons on a product detail page. */
export default function ProductBuy({
  id,
  name,
  price,
}: {
  id: string;
  name: string;
  price: number | null;
}) {
  const [added, setAdded] = useState(false);

  if (price === null) {
    return (
      <div className="flex flex-wrap gap-3">
        <a
          href={`/kontakt?predmet=${encodeURIComponent(`Dotaz: ${name}`)}`}
          className="btn-press rounded-full bg-teal px-8 py-3.5 text-[13px] tracking-[0.06em] text-page hover:bg-teal-hover"
        >
          POPTAT TENTO KUS
        </a>
        <a
          href="/vyroba-na-miru"
          className="btn-press rounded-full border border-ink px-8 py-3.5 text-[13px] tracking-[0.06em] text-ink hover:bg-ink hover:text-page"
        >
          NAVRHNOUT VLASTNÍ
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => {
          addToCart(id);
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1800);
        }}
        className="btn-press rounded-full bg-ink px-9 py-3.5 text-[13px] tracking-[0.06em] text-page hover:opacity-90"
      >
        {added ? "PŘIDÁNO ✓" : "DO KOŠÍKU"}
      </button>
      <a href="/kosik" className="text-sm text-brown-link underline-offset-2 hover:text-teal hover:underline">
        Přejít do košíku →
      </a>
    </div>
  );
}

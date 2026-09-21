import { useEffect, useMemo } from "react";
import { useStore } from "@nanostores/react";
import { $cart, setQty } from "../lib/cart";
import { formatKc, type Product } from "../lib/products";
import type { ShippingSettings } from "../lib/content";

function Stepper({ id, qty }: { id: string; qty: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border-2 bg-white px-1.5 py-1.5">
      <button
        type="button"
        onClick={() => setQty(id, qty - 1)}
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full hover:bg-footer"
        aria-label="Ubrat kus"
      >
        −
      </button>
      <span className="w-5 text-center text-sm">{qty}</span>
      <button
        type="button"
        onClick={() => setQty(id, qty + 1)}
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full hover:bg-footer"
        aria-label="Přidat kus"
      >
        +
      </button>
    </div>
  );
}

export default function CartView({
  products,
  shipping: shippingRule,
}: {
  products: Product[];
  shipping: ShippingSettings;
}) {
  const cart = useStore($cart);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  // products that were removed from the shop since they were added to the cart
  useEffect(() => {
    for (const id of Object.keys($cart.get())) {
      if (!byId.has(id)) setQty(id, 0);
    }
  }, [byId]);

  const entries = Object.entries(cart).filter(([id]) => byId.has(id));

  if (entries.length === 0) {
    return (
      <div className="rounded-[22px] bg-surface px-10 py-16 text-center">
        <p className="text-lg">Košík je zatím prázdný</p>
        <p className="mt-2 text-sm text-muted">
          Prohlédněte si naše produkty nebo si nechte vyrobit kus na míru.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <a href="/produkty" className="rounded-full bg-ink px-[34px] py-[17px] text-[13px] tracking-[0.06em] text-page">
            PROHLÉDNOUT PRODUKTY
          </a>
          <a href="/vyroba-na-miru" className="rounded-full border border-ink px-[34px] py-[17px] text-[13px] tracking-[0.06em] text-ink">
            VÝROBA NA MÍRU
          </a>
        </div>
      </div>
    );
  }

  const subtotal = entries.reduce((sum, [id, qty]) => sum + (byId.get(id)!.price ?? 0) * qty, 0);
  const shipping =
    subtotal === 0 ? 0 : subtotal >= shippingRule.freeFrom ? 0 : shippingRule.cost;
  const total = subtotal + shipping;
  const remaining = shippingRule.freeFrom - subtotal;
  const showFreeShipHint = subtotal > 0 && subtotal < shippingRule.freeFrom;

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.5fr_0.85fr]">
      <div className="flex flex-col gap-4">
        {entries.map(([id, qty]) => {
          const p = byId.get(id)!;
          const unit = p.price ?? 0;
          return (
            <div key={id} className="flex items-center gap-4 rounded-[20px] bg-surface p-[18px]">
              <div className="hatch h-[104px] w-[104px] shrink-0 overflow-hidden rounded-2xl">
                {p.image && (
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-[22px]">{p.name}</div>
                <div className="text-xs text-faint">{formatKc(unit)} / ks</div>
              </div>
              <Stepper id={id} qty={qty} />
              <div className="w-[110px] shrink-0 text-right text-base font-semibold">
                {formatKc(unit * qty)}
              </div>
              <button
                type="button"
                onClick={() => setQty(id, 0)}
                className="shrink-0 text-lg text-danger hover:opacity-70"
                aria-label="Odebrat"
              >
                ×
              </button>
            </div>
          );
        })}
        <a href="/produkty" className="mt-2 text-sm text-brown-link hover:text-teal">
          ← Pokračovat v nákupu
        </a>
      </div>

      <div className="rounded-[22px] bg-surface p-[30px] lg:sticky lg:top-[100px]">
        <h2 className="font-display text-[28px]">Souhrn objednávky</h2>

        <div className="mt-5 flex justify-between text-sm text-body">
          <span>Mezisoučet</span>
          <span>{formatKc(subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-body">
          <span>Doprava</span>
          <span>{shipping === 0 ? "Zdarma" : formatKc(shipping)}</span>
        </div>

        {showFreeShipHint && (
          <div className="mt-4 rounded-xl bg-footer px-4 py-3 text-xs text-brown-link">
            Do dopravy zdarma zbývá {formatKc(remaining)}.
          </div>
        )}

        <div className="my-5 border-t border-border-2" />

        <div className="flex items-center justify-between">
          <span className="text-sm">Celkem</span>
          <span className="font-display text-2xl">{formatKc(total)}</span>
        </div>

        <button
          type="button"
          className="mt-6 w-full rounded-full bg-teal px-8 py-[17px] text-[13px] tracking-[0.06em] text-page transition-colors hover:bg-teal-hover"
        >
          POKRAČOVAT K OBJEDNÁVCE
        </button>

        <p className="mt-4 text-center text-xs text-faintest">
          Bezpečná platba · Ruční výroba · Doručení 5–10 dní
        </p>
      </div>
    </div>
  );
}

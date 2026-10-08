import { useStore } from "@nanostores/react";
import { $cartCount } from "../lib/cart";

export default function CartBadge() {
  const count = useStore($cartCount);
  return (
    <a href="/kosik" className="flex items-center gap-3.5">
      <span className="hidden whitespace-nowrap text-[13px] text-muted sm:inline">{count} ks</span>
      <span className="whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-[13px] tracking-[0.03em] text-page sm:px-5">
        Košík
        {count > 0 && <span className="sm:hidden"> ({count})</span>}
      </span>
    </a>
  );
}

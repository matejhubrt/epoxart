import { useStore } from "@nanostores/react";
import { $cartCount } from "../lib/cart";

export default function CartBadge() {
  const count = useStore($cartCount);
  return (
    <a href="/kosik" className="flex items-center gap-3.5">
      <span className="text-[13px] text-muted">{count} ks</span>
      <span className="rounded-full bg-ink px-5 py-2.5 text-[13px] tracking-[0.03em] text-page">
        Košík
      </span>
    </a>
  );
}

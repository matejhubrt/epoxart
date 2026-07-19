import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";
import { PRODUCTS } from "./products";

/** productId -> quantity */
export type CartMap = Record<string, number>;

export const $cart = persistentAtom<CartMap>("epoxart_cart", {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addToCart(id: string) {
  const cart = $cart.get();
  $cart.set({ ...cart, [id]: (cart[id] || 0) + 1 });
}

export function setQty(id: string, qty: number) {
  const cart = { ...$cart.get() };
  if (qty <= 0) delete cart[id];
  else cart[id] = qty;
  $cart.set(cart);
}

export const $cartCount = computed($cart, (cart) =>
  Object.values(cart).reduce((a, b) => a + b, 0)
);

export const $cartSubtotal = computed($cart, (cart) =>
  Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return sum + (p?.price ? p.price * qty : 0);
  }, 0)
);

export const SHIPPING_COST = 149;
export const FREE_SHIPPING_THRESHOLD = 2500;

export const $shipping = computed($cartSubtotal, (subtotal) =>
  subtotal === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
);

export const $grandTotal = computed(
  [$cartSubtotal, $shipping],
  (subtotal, shipping) => subtotal + shipping
);

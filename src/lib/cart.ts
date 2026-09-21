import { persistentAtom } from "@nanostores/persistent";
import { computed } from "nanostores";

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

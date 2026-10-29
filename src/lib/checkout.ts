import type { ShippingSettings } from "./content";
import { isPersonalDelivery, type Product } from "./products";

/** The whole order path, shown as the segmented bar at the top (cart + 3 checkout pages). */
export const STEPS = [
  { key: "kosik", label: "Košík", href: "/kosik" },
  { key: "udaje", label: "Vaše údaje", href: "/objednavka#udaje" },
  { key: "doruceni", label: "Doručení", href: "/objednavka#doruceni" },
  { key: "platba", label: "Platba", href: "/objednavka#platba" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

// ---- totals --------------------------------------------------------------------------

export interface CartLine {
  product: Product;
  qty: number;
  total: number;
}

export interface CartTotals {
  lines: CartLine[];
  subtotal: number;
  /** goods that travel as a parcel (everything except tables and kitchens) */
  parcelSubtotal: number;
  hasParcel: boolean;
  /** tables / kitchens, delivered in person */
  hasPersonal: boolean;
  shipping: number;
  total: number;
  /** how much more parcel goods are needed for free postage */
  remaining: number;
  showFreeShipHint: boolean;
}

export function calcTotals(
  cart: Record<string, number>,
  byId: Map<string, Product>,
  rule: ShippingSettings
): CartTotals {
  const lines: CartLine[] = Object.entries(cart)
    .filter(([id, qty]) => byId.has(id) && qty > 0)
    .map(([id, qty]) => {
      const product = byId.get(id)!;
      return { product, qty, total: (product.price ?? 0) * qty };
    });

  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const parcelSubtotal = lines.reduce((s, l) => (isPersonalDelivery(l.product.cat) ? s : s + l.total), 0);
  const hasParcel = lines.some((l) => !isPersonalDelivery(l.product.cat));
  const hasPersonal = lines.some((l) => isPersonalDelivery(l.product.cat));
  const shipping = parcelSubtotal === 0 ? 0 : parcelSubtotal >= rule.freeFrom ? 0 : rule.cost;

  return {
    lines,
    subtotal,
    parcelSubtotal,
    hasParcel,
    hasPersonal,
    shipping,
    total: subtotal + shipping,
    remaining: rule.freeFrom - parcelSubtotal,
    showFreeShipHint: parcelSubtotal > 0 && parcelSubtotal < rule.freeFrom,
  };
}

// ---- the form ------------------------------------------------------------------------

export type PaymentChoice = "karta" | "prevod" | "misto" | "";

export interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  zip: string;
  note: string;
  payment: PaymentChoice;
  agree: boolean;
}

export const EMPTY_FORM: CheckoutForm = {
  name: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  zip: "",
  note: "",
  payment: "",
  agree: false,
};

export type Errors = Partial<Record<keyof CheckoutForm, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ]{9,16}$/;
const ZIP = /^[0-9]{3} ?[0-9]{2}$/;

export function validateContact(f: CheckoutForm): Errors {
  const e: Errors = {};
  if (f.name.trim().split(/\s+/).filter(Boolean).length < 2) e.name = "Napište prosím jméno a příjmení.";
  if (!EMAIL.test(f.email.trim())) e.email = "Zadejte platný e-mail, na který pošleme potvrzení.";
  if (!PHONE.test(f.phone.trim())) e.phone = "Zadejte telefon (alespoň 9 číslic), např. +420 777 123 456.";
  return e;
}

export function validateDelivery(f: CheckoutForm): Errors {
  const e: Errors = {};
  if (f.street.trim().length < 3) e.street = "Zadejte ulici a číslo popisné.";
  if (f.city.trim().length < 2) e.city = "Zadejte město nebo obec.";
  if (!ZIP.test(f.zip.trim())) e.zip = "PSČ má pět číslic, např. 262 23.";
  return e;
}

export function validatePayment(f: CheckoutForm, hasPersonal: boolean): Errors {
  const e: Errors = {};
  if (!f.payment || (f.payment === "misto" && !hasPersonal)) e.payment = "Vyberte způsob platby.";
  if (!f.agree) e.agree = "Pro odeslání objednávky je nutný souhlas s obchodními podmínkami.";
  return e;
}

const STORAGE_KEY = "epoxart_checkout";

/** Typed details live only in this browser tab (cleared when it is closed), never on a server yet. */
export function loadForm(): CheckoutForm {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FORM;
    return { ...EMPTY_FORM, ...(JSON.parse(raw) as Partial<CheckoutForm>) };
  } catch {
    return EMPTY_FORM;
  }
}

export function saveForm(f: CheckoutForm) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(f));
  } catch {
    /* private mode: the form just will not be remembered */
  }
}

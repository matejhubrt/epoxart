import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useStore } from "@nanostores/react";
import { $cart } from "../lib/cart";
import {
  calcTotals,
  loadForm,
  saveForm,
  STEPS,
  validateContact,
  validateDelivery,
  validatePayment,
  type CheckoutForm,
  type Errors,
  type PaymentChoice,
} from "../lib/checkout";
import { formatKc, type Product } from "../lib/products";
import type { ShippingSettings } from "../lib/content";
import CheckoutProgress from "./CheckoutProgress";

const stepFromHash = (): number => {
  const i = STEPS.findIndex((s) => s.key === window.location.hash.replace("#", ""));
  return i >= 1 ? i : 1;
};

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-[13px] text-sm focus:outline-none focus:ring-2 focus:ring-teal/20";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; className: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs tracking-[0.12em] text-brown-link">
        {label}
      </label>
      {children({
        id,
        className: `${inputBase} ${error ? "border-danger" : "border-border-2 focus:border-teal"}`,
        "aria-invalid": !!error,
        "aria-describedby": describedBy,
      })}
      {error ? (
        <p id={`${id}-err`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-faint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function Summary({
  totals,
}: {
  totals: ReturnType<typeof calcTotals>;
}) {
  return (
    <aside className="rounded-[22px] bg-surface p-[26px] lg:sticky lg:top-[100px]">
      <h2 className="font-display text-[26px]">Vaše objednávka</h2>
      <ul className="mt-4 flex flex-col gap-3">
        {totals.lines.map((l) => (
          <li key={l.product.id} className="flex items-center gap-3">
            <div className="hatch h-12 w-12 shrink-0 overflow-hidden rounded-lg">
              {l.product.image && <img src={l.product.image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">{l.product.name}</div>
              <div className="text-xs text-faint">{l.qty} ks</div>
            </div>
            <div className="text-sm font-semibold">{formatKc(l.total)}</div>
          </li>
        ))}
      </ul>

      <div className="my-5 border-t border-border-2" />

      <div className="flex justify-between text-sm text-body">
        <span>Mezisoučet</span>
        <span>{formatKc(totals.subtotal)}</span>
      </div>
      {totals.hasParcel && (
        <div className="mt-2 flex justify-between text-sm text-body">
          <span>Doprava zásilkou</span>
          <span>{totals.shipping === 0 ? "Zdarma" : formatKc(totals.shipping)}</span>
        </div>
      )}
      {totals.hasPersonal && (
        <div className="mt-2 flex justify-between gap-4 text-sm text-body">
          <span>Osobní doručení</span>
          <span className="text-right">dle dohody</span>
        </div>
      )}
      <div className="my-5 border-t border-border-2" />
      <div className="flex items-center justify-between">
        <span className="text-sm">Celkem</span>
        <span className="font-display text-2xl">{formatKc(totals.total)}</span>
      </div>
      <a href="/kosik" className="mt-5 inline-block text-xs text-brown-link hover:text-teal">
        ← Upravit košík
      </a>
    </aside>
  );
}

const PAYMENTS: { key: Exclude<PaymentChoice, "">; title: string; text: string; personalOnly?: boolean }[] = [
  { key: "karta", title: "Platební karta, Apple Pay, Google Pay", text: "Rychlá a bezpečná platba online přes platební bránu." },
  { key: "prevod", title: "Bankovní převod", text: "Platba z vašeho bankovního účtu." },
  {
    key: "misto",
    title: "Platba na místě při osobním předání",
    text: "Zaplatíte při převzetí stolu nebo kuchyně.",
    personalOnly: true,
  },
];

export default function Checkout({
  products,
  shipping,
  contact,
}: {
  products: Product[];
  shipping: ShippingSettings;
  contact: { email: string; phone: string };
}) {
  const cart = useStore($cart);
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const totals = useMemo(() => calcTotals(cart, byId, shipping), [cart, byId, shipping]);

  const [form, setForm] = useState<CheckoutForm>(() => loadForm());
  const [step, setStep] = useState<number>(() => stepFromHash());
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => saveForm(form), [form]);

  // browser back/forward moves between the steps
  useEffect(() => {
    const onHash = () => {
      setStep(stepFromHash());
      setErrors({});
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // nobody can skip ahead to a step whose earlier steps are incomplete
  const furthest = Object.keys(validateContact(form)).length
    ? 1
    : Object.keys(validateDelivery(form)).length
      ? 2
      : 3;
  useEffect(() => {
    if (totals.lines.length > 0 && step > furthest) {
      window.location.replace(`#${STEPS[furthest].key}`);
    }
  }, [step, furthest, totals.lines.length]);

  if (totals.lines.length === 0) {
    return (
      <div className="rounded-[22px] bg-surface px-10 py-16 text-center">
        <p className="text-lg">V košíku nic není</p>
        <p className="mt-2 text-sm text-muted">Nejdřív přidejte zboží do košíku.</p>
        <a
          href="/produkty"
          className="btn-press mt-7 rounded-full bg-ink px-[34px] py-[17px] text-[13px] tracking-[0.06em] text-page"
        >
          PROHLÉDNOUT PRODUKTY
        </a>
      </div>
    );
  }

  const set = <K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const goTo = (i: number) => {
    window.location.hash = STEPS[i].key;
  };

  const focusFirstError = () =>
    window.setTimeout(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus(), 30);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      const err = validateContact(form);
      setErrors(err);
      if (Object.keys(err).length) return focusFirstError();
      goTo(2);
    } else if (step === 2) {
      const err = validateDelivery(form);
      setErrors(err);
      if (Object.keys(err).length) return focusFirstError();
      goTo(3);
    } else {
      // The payment gateway is not connected yet, so this step only validates.
      setErrors(validatePayment(form, totals.hasPersonal));
    }
  };

  const card = "rounded-[22px] bg-surface p-6 sm:p-8";
  const primaryBtn =
    "btn-press rounded-full bg-teal px-9 py-3.5 text-[13px] tracking-[0.06em] text-page hover:bg-teal-hover disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div>
      <CheckoutProgress current={step} />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.5fr_0.85fr]">
        <form onSubmit={onSubmit} noValidate className={`${card} card-in`} key={step}>
          {step === 1 && (
            <>
              <h2 className="font-display text-[30px]">Vaše údaje</h2>
              <p className="mt-1 text-sm text-muted">Na tento e-mail pošleme potvrzení objednávky.</p>
              <div className="mt-6 flex flex-col gap-4">
                <Field id="co-name" label="JMÉNO A PŘÍJMENÍ" error={errors.name}>
                  {(p) => (
                    <input {...p} type="text" autoComplete="name" maxLength={120} value={form.name}
                      onChange={(e) => set("name", e.target.value)} />
                  )}
                </Field>
                <Field id="co-email" label="E-MAIL" error={errors.email}>
                  {(p) => (
                    <input {...p} type="email" autoComplete="email" maxLength={200} value={form.email}
                      onChange={(e) => set("email", e.target.value)} />
                  )}
                </Field>
                <Field id="co-phone" label="TELEFON" error={errors.phone} hint="Použijeme ho jen kvůli doručení.">
                  {(p) => (
                    <input {...p} type="tel" autoComplete="tel" inputMode="tel" maxLength={20} value={form.phone}
                      onChange={(e) => set("phone", e.target.value)} />
                  )}
                </Field>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="font-display text-[30px]">Doručení</h2>
              <p className="mt-1 text-sm text-muted">Kam máme zboží doručit.</p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-6">
                <div className="sm:col-span-6">
                  <Field id="co-street" label="ULICE A ČÍSLO POPISNÉ" error={errors.street}>
                    {(p) => (
                      <input {...p} type="text" autoComplete="street-address" maxLength={160} value={form.street}
                        onChange={(e) => set("street", e.target.value)} />
                    )}
                  </Field>
                </div>
                <div className="sm:col-span-4">
                  <Field id="co-city" label="MĚSTO / OBEC" error={errors.city}>
                    {(p) => (
                      <input {...p} type="text" autoComplete="address-level2" maxLength={100} value={form.city}
                        onChange={(e) => set("city", e.target.value)} />
                    )}
                  </Field>
                </div>
                <div className="sm:col-span-2">
                  <Field id="co-zip" label="PSČ" error={errors.zip}>
                    {(p) => (
                      <input {...p} type="text" autoComplete="postal-code" inputMode="numeric" maxLength={6} value={form.zip}
                        onChange={(e) => set("zip", e.target.value)} />
                    )}
                  </Field>
                </div>
              </div>

              <h3 className="mt-9 text-xs tracking-[0.18em] text-brown-link">ZPŮSOB DORUČENÍ</h3>
              <div className="mt-3 flex flex-col gap-3">
                {totals.hasParcel && (
                  <div className="flex items-start justify-between gap-4 rounded-2xl border border-teal bg-teal-wash/60 px-5 py-4">
                    <div>
                      <div className="text-sm font-semibold">Zaslání přepravní službou</div>
                      <div className="mt-0.5 text-[13px] text-body">Menší zboží pošleme na vaši adresu.</div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold">
                      {totals.shipping === 0 ? "Zdarma" : formatKc(totals.shipping)}
                    </div>
                  </div>
                )}
                {totals.hasPersonal && (
                  <div className="flex items-start justify-between gap-4 rounded-2xl border border-teal bg-teal-wash/60 px-5 py-4">
                    <div>
                      <div className="text-sm font-semibold">Osobní doručení</div>
                      <div className="mt-0.5 text-[13px] text-body">
                        Stoly a kuchyně vozíme osobně. Termín a místo předání s vámi domluvíme po odeslání objednávky.
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-semibold">dle dohody</div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <Field id="co-note" label="POZNÁMKA K DORUČENÍ (NEPOVINNÉ)">
                  {(p) => (
                    <textarea {...p} rows={3} maxLength={500} value={form.note}
                      onChange={(e) => set("note", e.target.value)} />
                  )}
                </Field>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="font-display text-[30px]">Platba</h2>

              <div className="mt-5 grid gap-3 rounded-2xl bg-page px-5 py-4 text-[13.5px] text-body sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-[0.12em] text-brown-link">KONTAKT</span>
                    <a href="#udaje" className="text-xs text-teal hover:underline">Upravit</a>
                  </div>
                  <div className="mt-1">{form.name}</div>
                  <div>{form.email}</div>
                  <div>{form.phone}</div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs tracking-[0.12em] text-brown-link">DORUČENÍ</span>
                    <a href="#doruceni" className="text-xs text-teal hover:underline">Upravit</a>
                  </div>
                  <div className="mt-1">{form.street}</div>
                  <div>{form.zip} {form.city}</div>
                </div>
              </div>

              <fieldset className="mt-7">
                <legend className="text-xs tracking-[0.18em] text-brown-link">ZPŮSOB PLATBY</legend>
                <div className="mt-3 flex flex-col gap-3">
                  {PAYMENTS.filter((p) => !p.personalOnly || totals.hasPersonal).map((p) => {
                    const on = form.payment === p.key;
                    return (
                      <label
                        key={p.key}
                        className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border px-5 py-4 transition-colors ${
                          on ? "border-teal bg-teal-wash/60" : "border-border-2 bg-white hover:border-ink"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={p.key}
                          checked={on}
                          onChange={() => set("payment", p.key)}
                          className="mt-1 h-4 w-4 accent-teal"
                        />
                        <span>
                          <span className="block text-sm font-semibold">{p.title}</span>
                          <span className="mt-0.5 block text-[13px] text-body">{p.text}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.payment && <p className="mt-2 text-xs text-danger">{errors.payment}</p>}
              </fieldset>

              <label className="mt-6 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-body">
                <input
                  type="checkbox"
                  checked={form.agree}
                  aria-invalid={!!errors.agree}
                  onChange={(e) => set("agree", e.target.checked)}
                  className="mt-1 h-4 w-4 accent-teal"
                />
                <span>
                  Souhlasím s{" "}
                  <a href="/obchodni-podminky" target="_blank" rel="noopener" className="text-teal underline">
                    obchodními podmínkami
                  </a>{" "}
                  a beru na vědomí{" "}
                  <a href="/ochrana-osobnich-udaju" target="_blank" rel="noopener" className="text-teal underline">
                    zásady ochrany osobních údajů
                  </a>
                  .
                </span>
              </label>
              {errors.agree && <p className="mt-2 text-xs text-danger">{errors.agree}</p>}

              <div className="mt-6 rounded-2xl bg-footer px-5 py-4 text-[13px] leading-relaxed text-body">
                <strong className="text-ink">Online platby právě připravujeme.</strong> Objednávku zde zatím nelze
                odeslat. Chcete-li objednat hned, napište nám na{" "}
                <a href={`mailto:${contact.email}`} className="text-teal underline">{contact.email}</a> nebo
                zavolejte na {contact.phone}.
              </div>
            </>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            {step === 1 ? (
              <a href="/kosik" className="text-sm text-brown-link hover:text-teal">← Zpět do košíku</a>
            ) : (
              <a href={`#${STEPS[step - 1].key}`} className="text-sm text-brown-link hover:text-teal">← Zpět</a>
            )}
            {step < 3 ? (
              <button type="submit" className={primaryBtn}>
                POKRAČOVAT
              </button>
            ) : (
              <button type="submit" className={primaryBtn} disabled={!form.payment || !form.agree}>
                ZAPLATIT A ODESLAT OBJEDNÁVKU
              </button>
            )}
          </div>
        </form>

        <Summary totals={totals} />
      </div>
    </div>
  );
}

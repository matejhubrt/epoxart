import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  WOOD_IDS,
  WOOD_LABELS,
  WOOD_SWATCHES,
  type ConfiguratorSettings,
  type Pigment,
  type ShippingSettings,
  type SiteTexts,
} from "../../lib/content";
import { CATEGORY_KEYS, CATEGORY_LABELS, type CategoryKey } from "../../lib/products";
import { fetchContent, saveSetting } from "../../lib/admin/api";
import { getSupabase } from "../../lib/supabase";
import { Button, Card, Field, inputCls, useDirtyGuard, type Notify } from "./ui";

const HEX = /^#[0-9a-fA-F]{6}$/;

const MAX_PIGMENTS = 30;
const colorInputCls = "h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border-2 bg-white p-1";

/** Resin pigments: name, colour and, for metallic ones, the colour they shimmer to. */
function PigmentList({ items, onChange }: { items: Pigment[]; onChange: (items: Pigment[]) => void }) {
  const update = (i: number, patch: Partial<Pigment>) =>
    onChange(items.map((o, n) => (n === i ? { ...o, ...patch } : o)));

  return (
    <div>
      <div className="mb-2 text-xs tracking-[0.12em] text-brown-link">PIGMENTY PRYSKYŘICE</div>
      <p className="mb-3 text-xs text-faint">
        Metalický pigment se na náhledu třpytí od základní barvy ke světlejšímu odlesku. Neprůhledný je jednolitý.
      </p>
      <ul className="flex flex-col gap-2.5">
        {items.map((o, i) => (
          <li key={i} className="flex flex-wrap items-center gap-2.5 sm:flex-nowrap">
            <input
              type="color"
              value={HEX.test(o.color) ? o.color : "#000000"}
              onChange={(e) => update(i, { color: e.target.value })}
              className={colorInputCls}
              aria-label={`Barva: ${o.label}`}
            />
            {o.shine !== null && (
              <input
                type="color"
                value={HEX.test(o.shine) ? o.shine : "#ffffff"}
                onChange={(e) => update(i, { shine: e.target.value })}
                className={colorInputCls}
                aria-label={`Odlesk: ${o.label}`}
                title="Barva odlesku"
              />
            )}
            <input
              value={o.label}
              maxLength={40}
              onChange={(e) => update(i, { label: e.target.value })}
              className={`${inputCls} min-w-0 flex-1`}
              aria-label="Název"
            />
            <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
              <input
                type="checkbox"
                checked={o.shine !== null}
                onChange={(e) => update(i, { shine: e.target.checked ? "#ffffff" : null })}
              />
              Metalický
            </label>
            <Button
              variant="danger"
              className="!px-3.5 !py-2"
              disabled={items.length <= 1}
              onClick={() => onChange(items.filter((_, n) => n !== i))}
              aria-label="Odebrat"
            >
              ×
            </Button>
          </li>
        ))}
      </ul>
      <Button
        className="mt-3 !py-2"
        disabled={items.length >= MAX_PIGMENTS}
        onClick={() => onChange([...items, { label: "Nový pigment", color: "#8a6a4f", shine: null }])}
      >
        + Přidat pigment
      </Button>
    </div>
  );
}

function PasswordCard({ notify }: { notify: Notify }) {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return notify("Heslo musí mít alespoň 8 znaků.", "error");
    if (password !== again) return notify("Hesla se neshodují.", "error");
    setBusy(true);
    const { error } = await getSupabase()!.auth.updateUser({ password });
    setBusy(false);
    if (error) return notify("Heslo se nepodařilo změnit. Přihlaste se prosím znovu.", "error");
    setPassword("");
    setAgain("");
    notify("Heslo bylo změněno.");
  }

  return (
    <Card title="Změna hesla">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field label="NOVÉ HESLO" hint="Alespoň 8 znaků.">
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="NOVÉ HESLO ZNOVU">
          <input
            type="password"
            autoComplete="new-password"
            value={again}
            onChange={(e) => setAgain(e.target.value)}
            className={inputCls}
          />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" variant="dark" disabled={busy || !password}>
            {busy ? "Ukládám…" : "Změnit heslo"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

type ContactKey = "phone1" | "phone2" | "email" | "owner" | "address" | "ico" | "instagram" | "facebook";

const CONTACT_FIELDS: { key: ContactKey; label: string; hint?: string }[] = [
  { key: "phone1", label: "TELEFON 1" },
  { key: "phone2", label: "TELEFON 2", hint: "Nepovinné – nechte prázdné, pokud nemáte druhé číslo." },
  { key: "email", label: "E-MAIL" },
  { key: "owner", label: "JMÉNO MAJITELE" },
  { key: "address", label: "ADRESA" },
  { key: "ico", label: "IČO" },
  { key: "instagram", label: "ODKAZ NA INSTAGRAM", hint: "Celá adresa, např. https://www.instagram.com/epoxart19/" },
  { key: "facebook", label: "ODKAZ NA FACEBOOK", hint: "Celá adresa stránky na Facebooku." },
];

/** Contact details and social links: structured data (phone/mail links, legal pages), so a form, not click-to-type. */
function ContactCard({ notify }: { notify: Notify }) {
  const [orig, setOrig] = useState<Record<ContactKey, string> | null>(null);
  const [vals, setVals] = useState<Record<ContactKey, string> | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchContent()
      .then((c) => {
        const pick = Object.fromEntries(CONTACT_FIELDS.map((f) => [f.key, c.texts[f.key]])) as Record<ContactKey, string>;
        setOrig(pick);
        setVals(pick);
      })
      .catch((e) => notify(e instanceof Error ? e.message : "Chyba načtení.", "error"));
  }, [notify]);

  const dirty = !!orig && !!vals && CONTACT_FIELDS.some((f) => vals[f.key] !== orig[f.key]);
  useDirtyGuard(dirty);

  if (!vals) return null;

  async function save() {
    if (!vals) return;
    const clean = Object.fromEntries(CONTACT_FIELDS.map((f) => [f.key, vals[f.key].trim()])) as Record<ContactKey, string>;
    if (!clean.phone1 || !clean.email) return notify("Telefon 1 a e-mail nesmí být prázdné.", "error");
    for (const k of ["instagram", "facebook"] as const) {
      if (clean[k] && !clean[k].toLowerCase().startsWith("https://")) {
        return notify("Odkazy musí začínat https://", "error");
      }
    }
    setBusy(true);
    try {
      // read-modify-write, so texts changed directly on the pages are never overwritten
      const fresh = await fetchContent();
      const texts: SiteTexts = { ...fresh.texts, ...clean };
      await saveSetting("texts", texts);
      setOrig(clean);
      setVals(clean);
      notify("Kontaktní údaje uloženy.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Uložení se nezdařilo.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Kontaktní údaje a odkazy">
      <div className="grid gap-4 sm:grid-cols-2">
        {CONTACT_FIELDS.map((f) => (
          <Field key={f.key} label={f.label} hint={f.hint}>
            <input
              value={vals[f.key]}
              onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}
              className={inputCls}
            />
          </Field>
        ))}
      </div>
      <div className="mt-5">
        <Button variant="primary" disabled={!dirty || busy} onClick={save}>
          {busy ? "Ukládám…" : dirty ? "Uložit kontaktní údaje" : "Uloženo"}
        </Button>
      </div>
    </Card>
  );
}

export function SettingsTab({ notify }: { notify: Notify }) {
  const [origConf, setOrigConf] = useState<ConfiguratorSettings | null>(null);
  const [origShip, setOrigShip] = useState<ShippingSettings | null>(null);
  const [conf, setConf] = useState<ConfiguratorSettings | null>(null);
  const [cost, setCost] = useState("");
  const [freeFrom, setFreeFrom] = useState("");
  const [hidden, setHidden] = useState<CategoryKey[]>([]);
  const [origHidden, setOrigHidden] = useState<CategoryKey[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent()
      .then((c) => {
        setOrigConf(c.configurator);
        setOrigShip(c.shipping);
        setConf(c.configurator);
        setCost(String(c.shipping.cost));
        setFreeFrom(String(c.shipping.freeFrom));
        setHidden(c.categories.hidden);
        setOrigHidden(c.categories.hidden);
      })
      .catch((e) => notify(e instanceof Error ? e.message : "Chyba načtení.", "error"));
  }, [notify]);

  const dirty = useMemo(
    () =>
      !!origConf &&
      !!origShip &&
      (JSON.stringify(conf) !== JSON.stringify(origConf) ||
        cost !== String(origShip.cost) ||
        freeFrom !== String(origShip.freeFrom) ||
        [...hidden].sort().join() !== [...origHidden].sort().join()),
    [conf, cost, freeFrom, hidden, origConf, origHidden, origShip]
  );
  useDirtyGuard(dirty);

  if (!conf) return <p className="text-sm text-muted">Načítám…</p>;

  async function save() {
    if (!conf) return;
    const costNum = Number(cost);
    const freeNum = Number(freeFrom);
    if (!Number.isFinite(costNum) || costNum < 0 || !Number.isFinite(freeNum) || freeNum < 0) {
      return notify("Doprava: zadejte prosím čísla (Kč).", "error");
    }
    if (conf.pigments.some((o) => !o.label.trim())) {
      return notify("Každý pigment musí mít název.", "error");
    }
    const labels = conf.pigments.map((o) => o.label.trim().toLowerCase());
    if (new Set(labels).size !== labels.length) {
      return notify("Dva pigmenty mají stejný název, přejmenujte prosím jeden z nich.", "error");
    }
    setSaving(true);
    try {
      const cleaned: ConfiguratorSettings = {
        hiddenWoods: conf.hiddenWoods,
        pigments: conf.pigments.map((o) => ({ ...o, label: o.label.trim() })),
      };
      const shipping: ShippingSettings = { cost: Math.round(costNum), freeFrom: Math.round(freeNum) };
      await saveSetting("configurator", cleaned);
      await saveSetting("shipping", shipping);
      await saveSetting("categories", { hidden });
      setConf(cleaned);
      setOrigConf(cleaned);
      setOrigShip(shipping);
      setOrigHidden(hidden);
      notify("Nastavení uloženo.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Uložení se nezdařilo.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[32px]">Nastavení</h2>
          <p className="text-sm text-muted">
            Kategorie na webu, konfigurátor stolu, doprava, kontaktní údaje a heslo.
          </p>
        </div>
        <Button variant="primary" disabled={!dirty || saving} onClick={save}>
          {saving ? "Ukládám…" : dirty ? "Uložit změny" : "Vše uloženo"}
        </Button>
      </div>

      <Card title="Kategorie na webu">
        <p className="mb-4 text-sm text-muted">
          Vypnutou kategorii návštěvníci neuvidí: zmizí z úvodní stránky i z filtru produktů a její
          produkty se nezobrazí. Nic se nemaže, kdykoli ji můžete znovu zapnout.
        </p>
        <ul className="flex flex-col gap-3">
          {CATEGORY_KEYS.map((k) => {
            const on = !hidden.includes(k);
            const isLastVisible = on && CATEGORY_KEYS.length - hidden.length === 1;
            return (
              <li
                key={k}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border-2 bg-white px-4 py-3"
              >
                <div>
                  <div className="font-display text-[20px] leading-tight">{CATEGORY_LABELS[k]}</div>
                  <div className="text-xs text-faint">
                    {on ? "Zobrazeno na webu" : "Skryto, na webu není vidět"}
                  </div>
                </div>
                <Button
                  variant={on ? "outline" : "primary"}
                  className="!px-4 !py-2"
                  disabled={isLastVisible}
                  title={isLastVisible ? "Alespoň jedna kategorie musí zůstat zapnutá." : undefined}
                  onClick={() =>
                    setHidden(on ? [...hidden, k] : hidden.filter((h) => h !== k))
                  }
                >
                  {on ? "Vypnout" : "Zapnout"}
                </Button>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card title="Konfigurátor stolu">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="mb-2 text-xs tracking-[0.12em] text-brown-link">DŘEVA</div>
            <p className="mb-3 text-xs text-faint">
              Náhled má hotové fotky pro tato čtyři dřeva. Dřevo, které nenabízíte, můžete vypnout.
            </p>
            <ul className="flex flex-col gap-2.5">
              {WOOD_IDS.map((w) => {
                const on = !conf.hiddenWoods.includes(w);
                const isLastVisible = on && WOOD_IDS.length - conf.hiddenWoods.length === 1;
                return (
                  <li
                    key={w}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border-2 bg-white px-4 py-2.5"
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      <span className="h-4 w-4 rounded-full" style={{ background: WOOD_SWATCHES[w] }} />
                      {WOOD_LABELS[w]}
                      {!on && <span className="text-xs text-faint">(skryto)</span>}
                    </span>
                    <Button
                      variant={on ? "outline" : "primary"}
                      className="!px-4 !py-1.5"
                      disabled={isLastVisible}
                      title={isLastVisible ? "Alespoň jedno dřevo musí zůstat zapnuté." : undefined}
                      onClick={() =>
                        setConf({
                          ...conf,
                          hiddenWoods: on ? [...conf.hiddenWoods, w] : conf.hiddenWoods.filter((h) => h !== w),
                        })
                      }
                    >
                      {on ? "Vypnout" : "Zapnout"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
          <PigmentList items={conf.pigments} onChange={(pigments) => setConf({ ...conf, pigments })} />
        </div>
      </Card>

      <Card title="Doprava">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CENA DOPRAVY (KČ)">
            <input
              inputMode="numeric"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="DOPRAVA ZDARMA OD (KČ)" hint="Při nákupu od této částky se doprava neúčtuje.">
            <input
              inputMode="numeric"
              value={freeFrom}
              onChange={(e) => setFreeFrom(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
      </Card>

      <ContactCard notify={notify} />

      <PasswordCard notify={notify} />
    </div>
  );
}

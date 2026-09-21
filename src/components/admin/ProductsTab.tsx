import { useCallback, useEffect, useState, type FormEvent } from "react";
import { CATEGORY_KEYS, CATEGORY_LABELS, formatKc, type CategoryKey } from "../../lib/products";
import {
  deleteProduct,
  fetchProducts,
  saveProduct,
  setProductVisible,
  swapProducts,
  type AdminProduct,
  type ProductDraft,
} from "../../lib/admin/api";
import { removeImageByUrl } from "../../lib/admin/media";
import { Button, Field, ImageField, inputCls, type Notify } from "./ui";

const EMPTY: ProductDraft = {
  name: "",
  cat: "prkenka",
  desc: "",
  price: null,
  image: null,
  visible: true,
};

function ProductForm({
  initial,
  onCancel,
  onSave,
  notify,
}: {
  initial: ProductDraft;
  onCancel: () => void;
  onSave: (draft: ProductDraft) => Promise<void>;
  notify: Notify;
}) {
  const [name, setName] = useState(initial.name);
  const [cat, setCat] = useState<CategoryKey>(initial.cat);
  const [desc, setDesc] = useState(initial.desc);
  const [price, setPrice] = useState(initial.price === null ? "" : String(initial.price));
  const [image, setImage] = useState<string | null>(initial.image);
  const [visible, setVisible] = useState(initial.visible);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const trimmed = price.trim();
    const parsed = trimmed === "" ? null : Number(trimmed.replace(/\s/g, ""));
    if (parsed !== null && (!Number.isInteger(parsed) || parsed < 0)) {
      notify("Cena musí být celé číslo v Kč (nebo nechte prázdné).", "error");
      return;
    }
    setBusy(true);
    try {
      await onSave({ id: initial.id, name, cat, desc, price: parsed, image, visible });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/45 px-4 py-8">
      <form
        onSubmit={submit}
        className="mx-auto w-full max-w-[640px] rounded-[26px] bg-surface p-6 sm:p-8"
      >
        <h2 className="font-display text-[30px]">
          {initial.id ? "Upravit produkt" : "Nový produkt"}
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          <Field label="NÁZEV">
            <input
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="KATEGORIE">
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value as CategoryKey)}
              className={inputCls}
            >
              {CATEGORY_KEYS.map((k) => (
                <option key={k} value={k}>
                  {CATEGORY_LABELS[k]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="POPIS" hint="Krátká věta, zobrazí se pod názvem.">
            <textarea
              rows={3}
              maxLength={600}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field
            label="CENA (KČ)"
            hint="Nechte prázdné pro „Cena na dotaz“. Produkt bez ceny nejde dát do košíku, zákazník ho poptá."
          >
            <input
              inputMode="numeric"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="např. 1290"
              className={inputCls}
            />
          </Field>
          <ImageField
            label="FOTKA"
            value={image}
            folder="products"
            onChange={setImage}
            notify={notify}
            ratio="aspect-[16/10]"
          />
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={visible}
              onChange={(e) => setVisible(e.target.checked)}
              className="h-4 w-4 accent-teal"
            />
            Zobrazit na webu
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button
            onClick={() => {
              // a photo uploaded during this edit is not needed any more
              if (image && image !== initial.image) removeImageByUrl(image);
              onCancel();
            }}
            disabled={busy}
          >
            Zrušit
          </Button>
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? "Ukládám…" : "Uložit produkt"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ProductsTab({ notify }: { notify: Notify }) {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [editing, setEditing] = useState<ProductDraft | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setProducts(await fetchProducts());
    } catch (e) {
      notify(e instanceof Error ? e.message : "Chyba načtení.", "error");
      setProducts([]);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(id: string, action: () => Promise<void>, okMessage?: string) {
    setBusyId(id);
    try {
      await action();
      await load();
      if (okMessage) notify(okMessage);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Něco se nepovedlo.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleSave(draft: ProductDraft) {
    try {
      await saveProduct(draft, products ?? []);
      setEditing(null);
      await load();
      notify(draft.id ? "Produkt uložen." : "Produkt přidán.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Uložení se nezdařilo.", "error");
    }
  }

  function handleDelete(p: AdminProduct) {
    if (!window.confirm(`Opravdu smazat „${p.name}“? Tuto akci nelze vrátit.`)) return;
    run(p.id, () => deleteProduct(p), "Produkt smazán.");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[32px]">Produkty</h2>
          <p className="text-sm text-muted">
            Přidávejte, upravujte a mažte produkty. Změny se na webu objeví do několika sekund.
          </p>
        </div>
        <Button variant="primary" onClick={() => setEditing(EMPTY)}>
          + Přidat produkt
        </Button>
      </div>

      {products === null && <p className="text-sm text-muted">Načítám…</p>}
      {products?.length === 0 && (
        <p className="rounded-[22px] bg-surface p-8 text-center text-sm text-muted">
          Zatím žádné produkty. Klikněte na „Přidat produkt“.
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {products?.map((p, i) => {
          const busy = busyId === p.id;
          return (
            <li
              key={p.id}
              className={`flex flex-wrap items-center gap-4 rounded-[20px] bg-surface p-3.5 pr-5 ${
                p.visible ? "" : "opacity-60"
              }`}
            >
              <div className="hatch h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                {p.image && <img src={p.image} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-[160px] flex-1">
                <div className="font-display text-[20px] leading-tight">{p.name}</div>
                <div className="text-xs text-faint">
                  {CATEGORY_LABELS[p.cat]} · {p.price === null ? "Cena na dotaz" : formatKc(p.price)}
                  {!p.visible && " · skryto"}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  className="!px-3 !py-2"
                  disabled={busy || i === 0}
                  onClick={() => run(p.id, () => swapProducts(p, products[i - 1]))}
                  aria-label="Posunout nahoru"
                >
                  ↑
                </Button>
                <Button
                  className="!px-3 !py-2"
                  disabled={busy || i === products.length - 1}
                  onClick={() => run(p.id, () => swapProducts(p, products[i + 1]))}
                  aria-label="Posunout dolů"
                >
                  ↓
                </Button>
                <Button
                  className="!px-4 !py-2"
                  disabled={busy}
                  onClick={() => run(p.id, () => setProductVisible(p.id, !p.visible))}
                >
                  {p.visible ? "Skrýt" : "Zobrazit"}
                </Button>
                <Button
                  className="!px-4 !py-2"
                  disabled={busy}
                  onClick={() =>
                    setEditing({
                      id: p.id,
                      name: p.name,
                      cat: p.cat,
                      desc: p.desc,
                      price: p.price,
                      image: p.image,
                      visible: p.visible,
                    })
                  }
                >
                  Upravit
                </Button>
                <Button
                  variant="danger"
                  className="!px-4 !py-2"
                  disabled={busy}
                  onClick={() => handleDelete(p)}
                >
                  Smazat
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {editing && (
        <ProductForm
          key={editing.id ?? "new"}
          initial={editing}
          onCancel={() => setEditing(null)}
          onSave={handleSave}
          notify={notify}
        />
      )}
    </div>
  );
}

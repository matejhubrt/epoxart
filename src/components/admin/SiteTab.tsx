import { useEffect, useMemo, useState } from "react";
import {
  INSTAGRAM_SLOTS,
  type SiteContent,
  type SiteImages,
  type SiteTexts,
} from "../../lib/content";
import { CATEGORY_KEYS, CATEGORY_LABELS, type CategoryKey } from "../../lib/products";
import { fetchContent, saveSetting } from "../../lib/admin/api";
import { removeImageByUrl } from "../../lib/admin/media";
import { Button, Card, Field, ImageField, inputCls, useDirtyGuard, type Notify } from "./ui";

interface TextField {
  key: keyof SiteTexts;
  label: string;
  hint?: string;
  multiline?: boolean;
}

const TEXT_GROUPS: { title: string; fields: TextField[] }[] = [
  {
    title: "Úvodní sekce (hlavní strana)",
    fields: [
      { key: "heroEyebrow", label: "MALÝ NADPIS NAD TITULKEM" },
      { key: "heroTitle1", label: "TITULEK – PRVNÍ ŘÁDEK" },
      { key: "heroTitle2", label: "TITULEK – DRUHÝ ŘÁDEK", hint: "Zobrazí se kurzívou v zelené barvě." },
      { key: "heroText", label: "TEXT POD TITULKEM", multiline: true },
    ],
  },
  {
    title: "Banner „Výroba na míru“ (hlavní strana)",
    fields: [
      { key: "customTitle", label: "NADPIS" },
      { key: "customText", label: "TEXT", multiline: true },
    ],
  },
  {
    title: "Stránka „O nás“",
    fields: [
      { key: "aboutTitle", label: "NADPIS" },
      { key: "aboutP1", label: "PRVNÍ ODSTAVEC", multiline: true },
      { key: "aboutP2", label: "DRUHÝ ODSTAVEC", multiline: true },
    ],
  },
  {
    title: "Kontakt a patička",
    fields: [
      { key: "footerText", label: "TEXT V PATIČCE", multiline: true },
      { key: "phone1", label: "TELEFON 1" },
      { key: "phone2", label: "TELEFON 2", hint: "Nepovinné – nechte prázdné, pokud nemáte druhé číslo." },
      { key: "email", label: "E-MAIL" },
      { key: "owner", label: "JMÉNO MAJITELE" },
      { key: "address", label: "ADRESA" },
      { key: "ico", label: "IČO" },
      { key: "instagram", label: "ODKAZ NA INSTAGRAM" },
      { key: "facebook", label: "ODKAZ NA FACEBOOK" },
    ],
  },
];

function urlsOf(images: SiteImages): string[] {
  return [
    images.hero,
    images.about,
    ...CATEGORY_KEYS.map((k) => images.categories[k]),
    ...images.instagram,
  ].filter((u): u is string => !!u);
}

export function SiteTab({ notify }: { notify: Notify }) {
  const [original, setOriginal] = useState<SiteContent | null>(null);
  const [texts, setTexts] = useState<SiteTexts | null>(null);
  const [images, setImages] = useState<SiteImages | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent()
      .then((c) => {
        setOriginal(c);
        setTexts(c.texts);
        setImages(c.images);
      })
      .catch((e) => notify(e instanceof Error ? e.message : "Chyba načtení.", "error"));
  }, [notify]);

  const dirty = useMemo(
    () =>
      !!original &&
      (JSON.stringify(texts) !== JSON.stringify(original.texts) ||
        JSON.stringify(images) !== JSON.stringify(original.images)),
    [original, texts, images]
  );
  useDirtyGuard(dirty);

  if (!texts || !images || !original) return <p className="text-sm text-muted">Načítám…</p>;

  const setImage = (patch: Partial<SiteImages>) => setImages({ ...images, ...patch });

  async function save() {
    if (!texts || !images || !original) return;
    setSaving(true);
    try {
      await saveSetting("texts", texts);
      await saveSetting("images", images);
      // photos that are no longer used anywhere can be deleted from storage
      const stillUsed = new Set(urlsOf(images));
      await Promise.all(
        urlsOf(original.images)
          .filter((u) => !stillUsed.has(u))
          .map((u) => removeImageByUrl(u))
      );
      setOriginal({ ...original, texts, images });
      notify("Změny uloženy. Na webu se objeví do několika sekund.");
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
          <h2 className="font-display text-[32px]">Fotky a texty</h2>
          <p className="text-sm text-muted">
            Upravte úvodní fotku, fotky kolekcí, texty a kontaktní údaje. Nezapomeňte kliknout na „Uložit změny“.
          </p>
        </div>
        <Button variant="primary" disabled={!dirty || saving} onClick={save}>
          {saving ? "Ukládám…" : dirty ? "Uložit změny" : "Vše uloženo"}
        </Button>
      </div>

      <Card title="Fotky">
        <div className="grid gap-6 sm:grid-cols-2">
          <ImageField
            label="ÚVODNÍ FOTKA (HLAVNÍ STRANA)"
            value={images.hero}
            folder="site"
            onChange={(u) => setImage({ hero: u })}
            notify={notify}
            ratio="aspect-[2/1]"
            className="sm:col-span-2"
          />
          {CATEGORY_KEYS.map((k: CategoryKey) => (
            <ImageField
              key={k}
              label={`KOLEKCE – ${CATEGORY_LABELS[k].toUpperCase()}`}
              value={images.categories[k]}
              folder="site"
              onChange={(u) => setImage({ categories: { ...images.categories, [k]: u } })}
              notify={notify}
              ratio="aspect-[4/3]"
            />
          ))}
          <ImageField
            label="O NÁS – PORTRÉT / DÍLNA"
            value={images.about}
            folder="site"
            onChange={(u) => setImage({ about: u })}
            notify={notify}
            ratio="aspect-[4/3]"
          />
        </div>
      </Card>

      <Card title="Instagram (6 čtvercových fotek)">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {Array.from({ length: INSTAGRAM_SLOTS }, (_, i) => (
            <ImageField
              key={i}
              label={`FOTKA ${i + 1}`}
              value={images.instagram[i] ?? null}
              folder="site"
              onChange={(u) =>
                setImage({ instagram: images.instagram.map((v, n) => (n === i ? u : v)) })
              }
              notify={notify}
              ratio="aspect-square"
            />
          ))}
        </div>
      </Card>

      {TEXT_GROUPS.map((g) => (
        <Card key={g.title} title={g.title}>
          <div className="flex flex-col gap-4">
            {g.fields.map((f) => (
              <Field key={f.key} label={f.label} hint={f.hint}>
                {f.multiline ? (
                  <textarea
                    rows={3}
                    value={texts[f.key]}
                    onChange={(e) => setTexts({ ...texts, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                ) : (
                  <input
                    value={texts[f.key]}
                    onChange={(e) => setTexts({ ...texts, [f.key]: e.target.value })}
                    className={inputCls}
                  />
                )}
              </Field>
            ))}
          </div>
        </Card>
      ))}

      <div className="flex justify-end">
        <Button variant="primary" disabled={!dirty || saving} onClick={save}>
          {saving ? "Ukládám…" : dirty ? "Uložit změny" : "Vše uloženo"}
        </Button>
      </div>
    </div>
  );
}

const PAGES: { href: string; title: string; text: string }[] = [
  { href: "/", title: "Úvodní stránka", text: "Hlavní fotka, nadpisy, kolekce, okénka pod nimi (přidat / smazat / přesunout) a fotky z Instagramu." },
  { href: "/o-nas", title: "O nás", text: "Příběh dílny, fotka a okénka s postupem výroby (přidat / smazat / přesunout)." },
  { href: "/produkty", title: "Produkty", text: "Nadpis stránky (samotné produkty jsou v záložce Produkty)." },
  { href: "/vyroba-na-miru", title: "Výroba na míru", text: "Nadpis a úvodní text konfigurátoru." },
  { href: "/kontakt", title: "Kontakt", text: "Nadpis stránky (údaje se mění v Nastavení)." },
];

/** Launcher: the real website opens in edit mode, so the owner edits what visitors will see. */
export function PagesTab() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-[32px]">Úpravy stránek</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Vyberte stránku. Otevře se váš skutečný web v režimu úprav: <strong>klikněte na text a pište</strong>,{" "}
          <strong>klikněte na fotku a nahrajte novou</strong>. Dole se zobrazí lišta s tlačítkem „Uložit změny“.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {PAGES.map((p) => (
          <li key={p.href}>
            <a
              href={`${p.href}?upravy=1`}
              className="group block h-full rounded-[22px] bg-surface p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(43,36,32,0.08)]"
            >
              <div className="font-display text-[26px] leading-tight group-hover:text-teal">{p.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.text}</p>
              <span className="mt-4 inline-block text-[13px] text-teal">Upravit stránku →</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="text-xs text-faint">
        Tip: když jste přihlášená/ý a procházíte web, vpravo dole se objeví tlačítko „Upravit web“ – režim
        úprav tak zapnete na kterékoli stránce.
      </p>
    </div>
  );
}

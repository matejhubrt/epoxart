import { useCallback, useEffect, useState } from "react";
import {
  deleteInquiry,
  fetchInquiries,
  setInquiryRead,
  type Inquiry,
} from "../../lib/admin/api";
import { Button, type Notify } from "./ui";

const CONFIG_LABELS: [string, string][] = [
  ["wood", "Dřevo"],
  ["resin", "Pryskyřice"],
  ["shape", "Tvar"],
  ["river", "Směr řeky"],
  ["size", "Rozměr"],
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("cs-CZ", { dateStyle: "medium", timeStyle: "short" });
}

export function InboxTab({ notify, onChanged }: { notify: Notify; onChanged: () => void }) {
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setItems(await fetchInquiries());
    } catch (e) {
      notify(e instanceof Error ? e.message : "Chyba načtení.", "error");
      setItems([]);
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
      onChanged();
      if (okMessage) notify(okMessage);
    } catch (e) {
      notify(e instanceof Error ? e.message : "Něco se nepovedlo.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-[32px]">Poptávky</h2>
          <p className="text-sm text-muted">
            Zprávy z kontaktního formuláře a poptávky z konfigurátoru stolu.
          </p>
        </div>
        <Button onClick={load}>Obnovit</Button>
      </div>

      {items === null && <p className="text-sm text-muted">Načítám…</p>}
      {items?.length === 0 && (
        <p className="rounded-[22px] bg-surface p-8 text-center text-sm text-muted">
          Zatím žádné zprávy.
        </p>
      )}

      <ul className="flex flex-col gap-4">
        {items?.map((q) => {
          const busy = busyId === q.id;
          const mailSubject = encodeURIComponent(
            q.subject ? `Re: ${q.subject}` : q.kind === "custom" ? "Re: Poptávka stolu na míru" : "Re: Vaše zpráva"
          );
          return (
            <li
              key={q.id}
              className={`rounded-[20px] bg-surface p-5 sm:p-6 ${
                q.isRead ? "" : "border-l-4 border-teal"
              }`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                    q.kind === "custom" ? "bg-teal-wash text-teal" : "bg-footer text-brown-link"
                  }`}
                >
                  {q.kind === "custom" ? "Na míru" : "Kontakt"}
                </span>
                {!q.isRead && <span className="text-[11px] font-medium text-teal">NOVÉ</span>}
                <span className="ml-auto text-xs text-faint">{formatDate(q.createdAt)}</span>
              </div>

              <div className="mt-2 font-display text-[22px] leading-tight">{q.name}</div>
              <a href={`mailto:${q.email}`} className="text-sm text-teal hover:underline">
                {q.email}
              </a>
              {q.subject && <div className="mt-3 text-sm font-medium">{q.subject}</div>}
              {q.message && (
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-body">{q.message}</p>
              )}

              {q.config && (
                <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 rounded-xl bg-footer p-4 text-sm sm:grid-cols-3">
                  {CONFIG_LABELS.map(([k, label]) => (
                    <div key={k}>
                      <dt className="text-[11px] tracking-[0.1em] text-brown-link">{label.toUpperCase()}</dt>
                      <dd>{q.config?.[k] || "—"}</dd>
                    </div>
                  ))}
                </dl>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href={`mailto:${q.email}?subject=${mailSubject}`}
                  className="inline-flex items-center rounded-full bg-teal px-5 py-2 text-[13px] text-page hover:bg-teal-hover"
                >
                  Odpovědět
                </a>
                <Button
                  className="!px-4 !py-2"
                  disabled={busy}
                  onClick={() => run(q.id, () => setInquiryRead(q.id, !q.isRead))}
                >
                  {q.isRead ? "Označit jako nepřečtené" : "Označit jako přečtené"}
                </Button>
                <Button
                  variant="danger"
                  className="!px-4 !py-2"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Smazat zprávu od ${q.name}?`)) {
                      run(q.id, () => deleteInquiry(q.id), "Zpráva smazána.");
                    }
                  }}
                >
                  Smazat
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

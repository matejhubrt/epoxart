import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabase, supabaseConfigured } from "../../lib/supabase";
import { checkIsAdmin, countUnread } from "../../lib/admin/api";
import { Login, SetNewPassword } from "./Login";
import { ProductsTab } from "./ProductsTab";
import { SiteTab } from "./SiteTab";
import { InboxTab } from "./InboxTab";
import { SettingsTab } from "./SettingsTab";
import { Button, Toast, type Notify } from "./ui";

type TabKey = "products" | "site" | "inbox" | "settings";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 text-center text-sm text-muted">
      <div>{children}</div>
    </div>
  );
}

export default function AdminApp() {
  const supabase = getSupabase();

  // undefined = still checking, null = signed out
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [recovery, setRecovery] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<TabKey>("products");
  const [unread, setUnread] = useState(0);
  const [toast, setToast] = useState<{ message: string; kind: "ok" | "error" } | null>(null);
  const toastTimer = useRef<number>(undefined);

  const notify = useCallback<Notify>((message, kind = "ok") => {
    setToast({ message, kind });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const userId = session?.user.id;
  useEffect(() => {
    setIsAdmin(null);
    if (!userId) return;
    checkIsAdmin().then(setIsAdmin);
  }, [userId]);

  const refreshUnread = useCallback(() => {
    countUnread().then(setUnread);
  }, []);
  useEffect(() => {
    if (isAdmin) refreshUnread();
  }, [isAdmin, refreshUnread]);

  if (!supabaseConfigured || !supabase) {
    return (
      <Centered>
        <p className="font-display text-2xl text-ink">Administrace zatím není nastavena.</p>
        <p className="mt-2">Chybí připojení k databázi.</p>
      </Centered>
    );
  }

  if (session === undefined) return <Centered>Načítám…</Centered>;
  if (recovery && session) {
    return <SetNewPassword onDone={() => setRecovery(false)} />;
  }
  if (!session) return <Login />;
  if (isAdmin === null) return <Centered>Načítám…</Centered>;

  if (!isAdmin) {
    return (
      <Centered>
        <p className="font-display text-2xl text-ink">Tento účet nemá přístup do administrace.</p>
        <p className="mt-2">Přihlášen jako {session.user.email}.</p>
        <Button className="mt-6" onClick={() => supabase.auth.signOut()}>
          Odhlásit se
        </Button>
      </Centered>
    );
  }

  const tabs: { key: TabKey; label: string; badge?: number }[] = [
    { key: "products", label: "Produkty" },
    { key: "site", label: "Fotky a texty" },
    { key: "inbox", label: "Poptávky", badge: unread },
    { key: "settings", label: "Nastavení" },
  ];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-[rgba(250,247,241,0.92)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1080px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-3.5">
          <div className="font-display text-[22px] font-semibold tracking-[0.14em]">EPOXART</div>
          <span className="rounded-full bg-footer px-3 py-1 text-[11px] tracking-[0.1em] text-brown-link">
            ADMINISTRACE
          </span>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="rounded-full px-4 py-2 text-[13px] text-muted hover:text-ink"
            >
              Zobrazit web ↗
            </a>
            <Button className="!px-4 !py-2" onClick={() => supabase.auth.signOut()}>
              Odhlásit se
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-[1080px] gap-1 overflow-x-auto px-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`relative whitespace-nowrap px-4 py-3 text-[14px] transition-colors ${
                tab === t.key ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {t.label}
              {!!t.badge && (
                <span className="ml-2 rounded-full bg-teal px-2 py-0.5 text-[11px] text-page">
                  {t.badge}
                </span>
              )}
              {tab === t.key && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-teal" />
              )}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-[1080px] px-5 py-8 pb-24">
        {tab === "products" && <ProductsTab notify={notify} />}
        {tab === "site" && <SiteTab notify={notify} />}
        {tab === "inbox" && <InboxTab notify={notify} onChanged={refreshUnread} />}
        {tab === "settings" && <SettingsTab notify={notify} />}
      </main>

      <Toast toast={toast} />
    </div>
  );
}

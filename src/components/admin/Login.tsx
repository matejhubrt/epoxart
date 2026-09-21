import { useState, type FormEvent } from "react";
import { getSupabase } from "../../lib/supabase";
import { Button, Field, inputCls } from "./ui";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    const { error } = await getSupabase()!.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) setError("Nesprávný e-mail nebo heslo.");
  }

  async function onForgot() {
    setError("");
    setInfo("");
    if (!email.trim()) {
      setError("Nejdřív vyplňte svůj e-mail a klikněte znovu.");
      return;
    }
    setBusy(true);
    const { error } = await getSupabase()!.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin`,
    });
    setBusy(false);
    if (error) setError("Odkaz se nepodařilo odeslat. Zkuste to prosím za chvíli.");
    else setInfo("Pokud e-mail existuje, poslali jsme na něj odkaz pro nastavení nového hesla.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full max-w-[400px] rounded-[26px] bg-surface p-8 sm:p-10">
        <div className="font-display text-[26px] font-semibold tracking-[0.14em]">EPOXART</div>
        <h1 className="mt-6 font-display text-[32px] font-medium leading-tight">Administrace</h1>
        <p className="mt-1 text-sm text-muted">Přihlaste se, abyste mohli upravovat web.</p>

        <div className="mt-7 flex flex-col gap-4">
          <Field label="E-MAIL">
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="HESLO">
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        {info && <p className="mt-4 rounded-xl bg-teal-wash px-4 py-3 text-sm text-teal">{info}</p>}

        <Button type="submit" variant="primary" disabled={busy} className="mt-6 w-full !py-3.5">
          {busy ? "…" : "PŘIHLÁSIT SE"}
        </Button>
        <button
          type="button"
          onClick={onForgot}
          disabled={busy}
          className="mt-4 w-full text-center text-sm text-brown-link hover:text-teal"
        >
          Zapomněli jste heslo?
        </button>
      </form>
    </div>
  );
}

/** Shown after the owner clicks the "reset password" link from the e-mail. */
export function SetNewPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Heslo musí mít alespoň 8 znaků.");
    if (password !== again) return setError("Hesla se neshodují.");
    setBusy(true);
    const { error } = await getSupabase()!.auth.updateUser({ password });
    setBusy(false);
    if (error) setError("Heslo se nepodařilo změnit. Zkuste to prosím znovu.");
    else onDone();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full max-w-[400px] rounded-[26px] bg-surface p-8 sm:p-10">
        <h1 className="font-display text-[32px] font-medium leading-tight">Nové heslo</h1>
        <p className="mt-1 text-sm text-muted">Zvolte si nové heslo pro přihlášení.</p>
        <div className="mt-7 flex flex-col gap-4">
          <Field label="NOVÉ HESLO" hint="Alespoň 8 znaků.">
            <input
              required
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="NOVÉ HESLO ZNOVU">
            <input
              required
              type="password"
              autoComplete="new-password"
              value={again}
              onChange={(e) => setAgain(e.target.value)}
              className={inputCls}
            />
          </Field>
        </div>
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        <Button type="submit" variant="primary" disabled={busy} className="mt-6 w-full !py-3.5">
          ULOŽIT HESLO
        </Button>
      </form>
    </div>
  );
}

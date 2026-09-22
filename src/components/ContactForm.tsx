import { useRef, useState, type FormEvent } from "react";
import { submitInquiry } from "../lib/inquiries";

// Real visitors need at least this long to read the form and type into it;
// a submission faster than this is almost certainly a bot script.
const MIN_FILL_TIME_MS = 2500;

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const mountedAt = useRef(Date.now());

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // hidden "website" field (only bots fill it in) + a minimum fill time —
    // both fail silently as "sent" so we don't tip off the bot.
    const isBot =
      String(f.get("website") ?? "") !== "" || Date.now() - mountedAt.current < MIN_FILL_TIME_MS;
    if (isBot) {
      setStatus("sent");
      return;
    }
    setStatus("sending");
    const res = await submitInquiry({
      kind: "contact",
      name: String(f.get("name") ?? "").trim(),
      email: String(f.get("email") ?? "").trim(),
      subject: String(f.get("subject") ?? "").trim(),
      message: String(f.get("message") ?? "").trim(),
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="rounded-[22px] bg-teal-wash p-8 text-teal">
        Děkujeme za zprávu! Ozveme se vám co nejdříve.
      </div>
    );
  }

  const input =
    "rounded-xl border border-border-2 bg-white px-4 py-[13px] text-sm focus:border-teal focus:outline-none";

  return (
    <form className="rounded-[22px] bg-surface p-[34px]" onSubmit={onSubmit}>
      <h2 className="font-display text-[30px]">Napište nám</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input required name="name" maxLength={200} type="text" placeholder="Jméno" className={input} />
        <input required name="email" maxLength={320} type="email" placeholder="E-mail" className={input} />
        <input name="subject" maxLength={300} type="text" placeholder="Předmět" className={`${input} sm:col-span-2`} />
        <textarea
          required
          name="message"
          maxLength={5000}
          rows={5}
          placeholder="Vaše zpráva"
          className={`${input} sm:col-span-2`}
        />
        <input
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
      </div>

      {status === "error" && (
        <p className="mt-4 text-sm text-danger">
          Zprávu se nepodařilo odeslat. Zkuste to prosím znovu nebo nám zavolejte.
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 rounded-full bg-teal px-8 py-3.5 text-[13px] tracking-[0.06em] text-page transition-colors hover:bg-teal-hover disabled:opacity-60"
      >
        {status === "sending" ? "ODESÍLÁM…" : "ODESLAT ZPRÁVU"}
      </button>
    </form>
  );
}

import { useState } from "react";

export default function ContactForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-[22px] bg-teal-wash p-8 text-teal">
        Děkujeme za zprávu! Ozveme se vám co nejdříve.
      </div>
    );
  }

  return (
    <form
      className="rounded-[22px] bg-surface p-[34px]"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <h2 className="font-display text-[30px]">Napište nám</h2>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          required
          type="text"
          placeholder="Jméno"
          className="rounded-xl border border-border-2 bg-white px-4 py-[13px] text-sm focus:border-teal focus:outline-none"
        />
        <input
          required
          type="email"
          placeholder="E-mail"
          className="rounded-xl border border-border-2 bg-white px-4 py-[13px] text-sm focus:border-teal focus:outline-none"
        />
        <input
          type="text"
          placeholder="Předmět"
          className="rounded-xl border border-border-2 bg-white px-4 py-[13px] text-sm focus:border-teal focus:outline-none sm:col-span-2"
        />
        <textarea
          required
          rows={5}
          placeholder="Vaše zpráva"
          className="rounded-xl border border-border-2 bg-white px-4 py-[13px] text-sm focus:border-teal focus:outline-none sm:col-span-2"
        />
      </div>

      <button
        type="submit"
        className="mt-6 rounded-full bg-teal px-8 py-3.5 text-[13px] tracking-[0.06em] text-page transition-colors hover:bg-teal-hover"
      >
        ODESLAT ZPRÁVU
      </button>
    </form>
  );
}

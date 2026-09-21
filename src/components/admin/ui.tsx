import { useEffect, useRef, useState, type ReactNode } from "react";
import { uploadImage } from "../../lib/admin/media";

export type Notify = (message: string, kind?: "ok" | "error") => void;

export const inputCls =
  "w-full rounded-xl border border-border-2 bg-white px-4 py-[11px] text-sm focus:border-teal focus:outline-none";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs tracking-[0.12em] text-brown-link">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-faint">{hint}</span>}
    </label>
  );
}

const buttonBase =
  "inline-flex items-center justify-center whitespace-nowrap rounded-full px-5 py-2.5 text-[13px] tracking-[0.03em] transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const variants = {
  primary: "bg-teal text-page hover:bg-teal-hover",
  dark: "bg-ink text-page hover:opacity-90",
  outline: "border border-border-2 bg-surface text-ink hover:border-ink",
  danger: "border border-danger text-danger hover:bg-danger hover:text-page",
} as const;

export function Button({
  variant = "outline",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      type="button"
      {...props}
      className={`${buttonBase} ${variants[variant]} ${className}`}
    />
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] bg-surface p-6 sm:p-7">
      {title && <h2 className="mb-5 font-display text-[26px]">{title}</h2>}
      {children}
    </section>
  );
}

/** Photo picker: shows the current photo, uploads a new one (resized in the browser) or removes it. */
export function ImageField({
  label,
  value,
  folder,
  onChange,
  notify,
  ratio = "aspect-[4/3]",
  className = "",
}: {
  label: string;
  value: string | null;
  folder: string;
  onChange: (url: string | null) => void;
  notify: Notify;
  ratio?: string;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadImage(folder, file));
    } catch (e) {
      notify(e instanceof Error ? e.message : "Nahrání se nezdařilo.", "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className={className}>
      <div className="mb-1.5 text-xs tracking-[0.12em] text-brown-link">{label}</div>
      <div className={`hatch relative overflow-hidden rounded-2xl border border-border-2 ${ratio}`}>
        {value && <img src={value} alt="" className="absolute inset-0 h-full w-full object-cover" />}
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[11px] text-faint">
            [ bez fotky ]
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-page/70 text-sm">
            Nahrávám…
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" className="!px-4 !py-2" disabled={busy} onClick={() => input.current?.click()}>
          {value ? "Změnit fotku" : "Nahrát fotku"}
        </Button>
        {value && (
          <Button variant="outline" className="!px-4 !py-2" disabled={busy} onClick={() => onChange(null)}>
            Odebrat
          </Button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

/** Warns before leaving the page while there are unsaved changes. */
export function useDirtyGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}

export function Toast({ toast }: { toast: { message: string; kind: "ok" | "error" } | null }) {
  if (!toast) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full px-6 py-3 text-sm shadow-lg ${
        toast.kind === "error" ? "bg-danger text-white" : "bg-ink text-page"
      }`}
    >
      {toast.message}
    </div>
  );
}

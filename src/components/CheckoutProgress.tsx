import { STEPS } from "../lib/checkout";

/**
 * Segmented progress bar: one line per step. Finished steps are full and vivid green,
 * the current step fills up (in a softer green) as its fields are completed, the rest stay empty.
 * `current` is the index in STEPS (0 = cart), `currentFill` is 0..1 for the current step.
 */
export default function CheckoutProgress({
  current,
  currentFill = 1,
}: {
  current: number;
  currentFill?: number;
}) {
  return (
    <nav aria-label="Průběh objednávky" className="mb-10">
      <ol className="grid grid-cols-4 gap-2.5 sm:gap-4">
        {STEPS.map((s, i) => {
          const done = i < current;
          const active = i === current;
          const fill = done ? 1 : active ? Math.min(1, Math.max(0, currentFill)) : 0;
          const label = (
            <>
              <span className="font-mono text-[10.5px] tracking-[0.14em] text-faint sm:text-[11px]">
                {done ? "✓" : String(i + 1).padStart(2, "0")}
              </span>
              <span className="mt-0.5 block text-[12px] sm:text-[13.5px]">{s.label}</span>
            </>
          );
          return (
            <li key={s.key} aria-current={active ? "step" : undefined} className="min-w-0">
              <div className="h-[5px] overflow-hidden rounded-full bg-border-2" aria-hidden="true">
                <div
                  className={`h-full origin-left rounded-full transition-transform duration-700 ease-out ${
                    done ? "bg-teal" : "bg-teal/55"
                  }`}
                  style={{ transform: `scaleX(${fill})` }}
                />
              </div>
              <div
                className={`mt-2.5 truncate ${
                  active ? "font-semibold text-ink" : done ? "text-teal" : "text-faint"
                }`}
              >
                {done ? (
                  <a href={s.href} className="hover:underline" aria-label={`Zpět na krok: ${s.label}`}>
                    {label}
                  </a>
                ) : (
                  label
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

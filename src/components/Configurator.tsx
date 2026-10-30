import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  WOOD_IDS,
  WOOD_LABELS,
  WOOD_PHOTO_SOURCE,
  WOOD_SWATCHES,
  type Pigment,
  type WoodId,
  type WoodInfo,
} from "../lib/content";
import { submitInquiry } from "../lib/inquiries";

const SHAPES = ["Obdélník", "Oválné", "Čtverec", "Kulaté"] as const;
const RIVERS = ["Podél", "Napříč", "Diagonálně", "U kraje"] as const;

type Shape = (typeof SHAPES)[number];
type River = (typeof RIVERS)[number];

interface Config {
  wood: WoodId;
  resin: string;
  /** true = solid wood, no epoxy river at all */
  noResin: boolean;
  shape: Shape;
  size: string;
  river: River;
}

/* ---------- rendered pictures ----------
 * public/konfigurator/<shape>-<wood>-<river>.webp is a studio render (Blender) with a transparent
 * background. With a river there is also <same name>_resin.png: red = where the resin is,
 * green = light falling on it / 2, blue = its reflections / 4 (both sRGB-encoded linear).
 * The resin is poured here in the chosen pigment, so any colour works without new renders.
 */
const SHAPE_FILE: Record<Shape, string> = { Obdélník: "obdelnik", Oválné: "ovalne", Čtverec: "ctverec", Kulaté: "kulate" };
const RIVER_FILE: Record<River, string> = { Podél: "podel", Napříč: "napric", Diagonálně: "diag", "U kraje": "kraj" };
// on a square or round top "across" is the same picture as "along"
const SYMMETRIC: Partial<Record<Shape, true>> = { Čtverec: true, Kulaté: true };
// the renders were saved 0.8 stops under, so the resin is poured at the same exposure
const EXPOSURE = Math.pow(2, -0.8);

function renderPath(cfg: Config): string {
  const river = cfg.noResin
    ? "none"
    : SYMMETRIC[cfg.shape] && cfg.river === "Napříč"
      ? "podel"
      : RIVER_FILE[cfg.river];
  return `/konfigurator/${SHAPE_FILE[cfg.shape]}-${cfg.wood}-${river}`;
}

const toLinear = (c: number) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const LINEAR = Float32Array.from({ length: 256 }, (_, i) => toLinear(i));
const ENCODE = Uint8Array.from({ length: 4096 }, (_, i) => {
  const l = i / 4095;
  return Math.round((l <= 0.0031308 ? l * 12.92 : 1.055 * Math.pow(l, 1 / 2.4) - 0.055) * 255);
});
const hexToLinear = (h: string) => [1, 3, 5].map((i) => toLinear(parseInt(h.slice(i, i + 2), 16)));

function hash(n: number): number {
  n = Math.imul(n ^ (n >>> 15), 2246822519);
  n = Math.imul(n ^ (n >>> 13), 3266489917);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

/** Smooth noise warped into flowing swirls, like mica stirred into resin: 0..1 per pixel. */
const swirlCache = new Map<string, Float32Array>();
function swirlField(w: number, h: number): Float32Array {
  const key = `${w}x${h}`;
  const cached = swirlCache.get(key);
  if (cached) return cached;
  const G = 64;
  const grid = Float32Array.from({ length: (G + 1) * (G + 1) }, (_, i) => hash(i * 7919 + 13));
  const noise = (x: number, y: number) => {
    x = ((x % G) + G) % G;
    y = ((y % G) + G) % G;
    const xi = x | 0, yi = y | 0, fx = x - xi, fy = y - yi;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), r = G + 1;
    const a = grid[yi * r + xi], b = grid[yi * r + xi + 1], c = grid[(yi + 1) * r + xi], e = grid[(yi + 1) * r + xi + 1];
    return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v;
  };
  const out = new Float32Array(w * h), s = 1 / 55;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const wx = x * s + 2.2 * noise(x * s * 0.6, y * s * 0.6 + 5);
      const wy = y * s + 2.2 * noise(x * s * 0.6 + 9, y * s * 0.6);
      const n = 0.6 * noise(wx, wy) + 0.3 * noise(wx * 2.3, wy * 2.3) + 0.1 * noise(wx * 5, wy * 5);
      out[y * w + x] = Math.max(0, Math.min(1, (n - 0.3) * 1.9));
    }
  }
  swirlCache.set(key, out);
  return out;
}

const imageCache = new Map<string, Promise<HTMLImageElement>>();
function loadImage(src: string): Promise<HTMLImageElement> {
  let p = imageCache.get(src);
  if (!p) {
    p = new Promise((ok, fail) => {
      const im = new Image();
      im.onload = () => ok(im);
      im.onerror = fail;
      im.src = src;
    });
    imageCache.set(src, p);
    p.catch(() => imageCache.delete(src));
  }
  return p;
}

function pixelsOf(im: HTMLImageElement): ImageData {
  const c = document.createElement("canvas");
  c.width = im.naturalWidth;
  c.height = im.naturalHeight;
  const x = c.getContext("2d", { willReadFrequently: true })!;
  x.drawImage(im, 0, 0);
  return x.getImageData(0, 0, c.width, c.height);
}

/** Pours the pigment into the render's resin, keeping the rendered light and reflections. */
function pourResin(img: ImageData, map: ImageData, pigment: Pigment) {
  const d = img.data, m = map.data;
  const base = hexToLinear(pigment.color);
  const shine = pigment.shine ? hexToLinear(pigment.shine) : null;
  const shineMax = shine ? Math.max(...shine, 1e-4) : 1;
  const swirl = shine ? swirlField(img.width, img.height) : null;
  const c = [0, 0, 0];
  for (let i = 0, px = 0; i < d.length; i += 4, px++) {
    const a = m[i] / 255;
    if (a < 0.01) continue;
    const light = LINEAR[m[i + 1]] * 2, gloss = LINEAR[m[i + 2]] * 4;
    if (shine && swirl) {
      // mica: pearly swirls between base and highlight, tinted reflections, a fine sparkle
      const t = swirl[px], spark = hash(px) > 0.9965 ? 0.9 * light : 0;
      for (let k = 0; k < 3; k++) {
        const body = base[k] + (shine[k] - base[k]) * t;
        c[k] = body * light * 1.15 + gloss * (0.35 + (0.65 * shine[k]) / shineMax) + spark * shine[k];
      }
    } else {
      for (let k = 0; k < 3; k++) c[k] = base[k] * light + gloss;
    }
    for (let k = 0; k < 3; k++) {
      const v = ENCODE[Math.min(4095, Math.round(c[k] * EXPOSURE * 4095))];
      d[i + k] = d[i + k] * (1 - a) + v * a;
    }
  }
}

// the floor shadow reaches the picture's edge: fade all four edges so it never ends in a hard line
const EDGE_GRADIENTS =
  "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent), linear-gradient(to bottom, transparent, #000 7%, #000 90%, transparent)";
const EDGE_FADE: CSSProperties = {
  maskImage: EDGE_GRADIENTS,
  maskComposite: "intersect",
  WebkitMaskImage: EDGE_GRADIENTS,
  WebkitMaskComposite: "source-in",
};

function TablePreview({ cfg, pigment }: { cfg: Config; pigment: Pigment }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    const base = renderPath(cfg);
    setState((s) => (s === "error" ? "loading" : s));
    (async () => {
      try {
        const [main, map] = await Promise.all([
          loadImage(base + ".webp"),
          cfg.noResin ? null : loadImage(base + "_resin.png"),
        ]);
        if (cancelled || !canvas.current) return;
        const img = pixelsOf(main);
        if (map) pourResin(img, pixelsOf(map), pigment);
        if (cancelled) return;
        canvas.current.width = img.width;
        canvas.current.height = img.height;
        canvas.current.getContext("2d")!.putImageData(img, 0, 0);
        setState("ready");
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cfg.shape, cfg.wood, cfg.noResin, cfg.river, pigment]);

  return (
    <div className="relative w-full">
      <canvas
        ref={canvas}
        width={1000}
        height={700}
        role="img"
        aria-label={`Náhled stolu: ${cfg.shape}, ${WOOD_LABELS[cfg.wood]}${
          cfg.noResin ? ", bez pryskyřice" : `, řeka ${cfg.river.toLowerCase()}, ${pigment.label}`
        }`}
        className={`block aspect-[10/7] h-auto w-full transition-opacity duration-300 ${
          state === "ready" ? "opacity-100" : "opacity-40"
        }`}
        style={EDGE_FADE}
      />
      {state !== "ready" && (
        <p className="absolute inset-x-0 bottom-3 text-center text-xs text-muted" aria-live="polite">
          {state === "loading" ? "Načítám náhled…" : "Náhled se nepodařilo načíst. Zkuste stránku obnovit."}
        </p>
      )}
    </div>
  );
}

// Real visitors need at least this long to fill in a few fields;
// a submission faster than this is almost certainly a bot script.
const MIN_FILL_TIME_MS = 2500;

function InquiryForm({ cfg }: { cfg: Config }) {
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
      kind: "custom",
      name: String(f.get("name") ?? "").trim(),
      email: String(f.get("email") ?? "").trim(),
      message: String(f.get("message") ?? "").trim(),
      config: {
        wood: WOOD_LABELS[cfg.wood],
        resin: cfg.noResin ? "Bez pryskyřice (čisté dřevo)" : cfg.resin,
        shape: cfg.shape,
        river: cfg.noResin ? "—" : cfg.river,
        size: cfg.size,
      },
    });
    setStatus(res.ok ? "sent" : "error");
  }

  if (status === "sent") {
    return (
      <div className="rounded-[22px] bg-teal-wash p-7 text-teal">
        Děkujeme! Vaše poptávka byla odeslána — brzy se vám ozveme.
      </div>
    );
  }

  const input =
    "rounded-xl border border-border-2 bg-white px-4 py-[13px] text-sm focus:border-teal focus:outline-none";

  return (
    <form className="rounded-[22px] bg-surface p-7" onSubmit={onSubmit}>
      <h3 className="font-display text-[26px]">Nezávazná poptávka</h3>
      <p className="mt-1 text-[13px] text-muted">
        Ozveme se s cenovou nabídkou na míru vaší konfiguraci.
      </p>
      <p className="mt-3 rounded-xl bg-footer px-4 py-3 text-[12.5px] leading-relaxed text-body">
        Stoly a další nábytek na míru <strong>doručujeme osobně</strong>. Termín a místo předání
        domluvíme spolu v cenové nabídce.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <input required name="name" maxLength={200} type="text" placeholder="Jméno" className={input} />
        <input required name="email" maxLength={320} type="email" placeholder="E-mail" className={input} />
        <textarea
          name="message"
          maxLength={5000}
          rows={4}
          placeholder="Poznámka (rozměr, termín, inspirace…)"
          className={input}
        />
        <input
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        {status === "error" && (
          <p className="text-sm text-danger">
            Poptávku se nepodařilo odeslat. Zkuste to prosím znovu nebo nám zavolejte.
          </p>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-1 rounded-full bg-teal px-8 py-3.5 text-[13px] tracking-[0.06em] text-page transition-colors hover:bg-teal-hover disabled:opacity-60"
        >
          {status === "sending" ? "ODESÍLÁM…" : "ODESLAT POPTÁVKU"}
        </button>
      </div>
    </form>
  );
}

function Swatch({ p, size = "h-4 w-4" }: { p: Pigment; size?: string }) {
  return (
    <span
      className={`${size} shrink-0 rounded-full border border-black/10`}
      style={{
        background: p.shine ? `radial-gradient(circle at 35% 30%, ${p.shine}, ${p.color} 70%)` : p.color,
      }}
    />
  );
}

/** One button showing the chosen pigment; it opens the full list, grouped into metallic and opaque. */
function PigmentPicker({
  pigments,
  value,
  onChange,
}: {
  pigments: Pigment[];
  value: Pigment;
  onChange: (label: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const groups = [
    { title: "Metalické pigmenty", list: pigments.filter((p) => p.shine) },
    { title: "Neprůhledné pigmenty", list: pigments.filter((p) => !p.shine) },
  ].filter((g) => g.list.length > 0);

  // close on a click outside or on Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border border-border-2 bg-white px-4 py-3 text-left text-sm transition-colors hover:border-ink focus:border-teal focus:outline-none"
      >
        <Swatch p={value} size="h-6 w-6" />
        <span className="flex-1">
          {value.label}
          <span className="ml-2 text-xs text-faint">{value.shine ? "metalický" : "neprůhledný"}</span>
        </span>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className={`h-4 w-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 8l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Odstín pryskyřice"
          className="absolute inset-x-0 top-full z-20 mt-2 max-h-[340px] overflow-y-auto rounded-xl border border-border-2 bg-white p-2 shadow-[0_18px_38px_-18px_rgba(43,36,32,0.35)]"
        >
          {groups.map((g) => (
            <div key={g.title} className="mb-1 last:mb-0">
              <div className="px-2 pb-1 pt-2 text-[11px] tracking-[0.08em] text-faint">{g.title}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2">
                {g.list.map((p) => {
                  const active = p.label === value.label;
                  return (
                    <button
                      key={p.label}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        onChange(p.label);
                        setOpen(false);
                      }}
                      className={`flex items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13px] transition-colors hover:bg-footer ${
                        active ? "bg-footer font-medium" : ""
                      }`}
                    >
                      <Swatch p={p} />
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Configurator({
  hiddenWoods,
  pigments,
  woodInfo,
}: {
  hiddenWoods: WoodId[];
  pigments: Pigment[];
  woodInfo: Record<WoodId, WoodInfo>;
}) {
  const woods = WOOD_IDS.filter((w) => !hiddenWoods.includes(w));
  const [cfg, setCfg] = useState<Config>({
    wood: woods[0],
    resin: pigments[0].label,
    noResin: false,
    shape: "Obdélník",
    size: "",
    river: "Podél",
  });

  const pigment = pigments.find((p) => p.label === cfg.resin) ?? pigments[0];

  const summary = useMemo(
    () => ({
      line1: cfg.noResin
        ? `${WOOD_LABELS[cfg.wood]} · čisté dřevo, bez pryskyřice`
        : `${WOOD_LABELS[cfg.wood]} · ${cfg.resin} · řeka ${cfg.river}`,
      line2: `${cfg.shape} · ${cfg.size || "rozměr neuveden"}`,
    }),
    [cfg]
  );

  // after the first picture, fetch the other woods' pictures for this shape in the background
  useEffect(() => {
    const t = setTimeout(() => {
      for (const w of woods) loadImage(renderPath({ ...cfg, wood: w }) + ".webp").catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [cfg.shape, cfg.river, cfg.noResin]);

  const top = useRef<HTMLDivElement>(null);
  const chooseWood = (w: WoodId) => {
    setCfg((c) => ({ ...c, wood: w }));
    // chosen from the section below: bring the table back into view
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={top} className="scroll-mt-[90px]">
    <div className="grid grid-cols-1 items-start gap-9 md:grid-cols-[1fr_0.9fr]">
      <div className="md:sticky md:top-[100px]">
        <div className="overflow-hidden rounded-[26px] bg-[radial-gradient(120%_90%_at_50%_35%,var(--color-surface),var(--color-warm))] px-2 py-6 sm:px-4">
          <TablePreview cfg={cfg} pigment={pigment} />
        </div>
        <p className="mt-4 whitespace-pre-line text-center font-mono text-[11px] leading-relaxed text-faint">
          {summary.line1}
          {"\n"}
          {summary.line2}
        </p>
        <p className="mt-2 text-center text-[11.5px] leading-relaxed text-faint">
          Každá deska je originál. Kresba dřeva i tvar řeky se na vašem stole budou lišit, barvy jsou orientační.
        </p>
      </div>

      <div className="flex flex-col gap-7">
        <div>
          <div className="mb-3 text-xs tracking-[0.18em] text-brown-link">DŘEVO</div>
          <div className="flex flex-wrap gap-2.5">
            {woods.map((w) => {
              const active = cfg.wood === w;
              return (
                <button
                  key={w}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCfg((c) => ({ ...c, wood: w }))}
                  className={`flex items-center gap-2.5 rounded-full border px-[15px] py-[9px] text-[13px] transition-colors ${
                    active ? "border-ink bg-footer" : "border-border-2 bg-surface"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: WOOD_SWATCHES[w] }} />
                  {WOOD_LABELS[w]}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs tracking-[0.18em] text-brown-link">PROVEDENÍ</div>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setCfg((c) => ({ ...c, noResin: false }))}
              className={`rounded-full border px-[22px] py-2.5 text-[13.5px] transition-colors ${
                !cfg.noResin ? "border-ink bg-ink text-page" : "border-border-2 bg-surface text-ink"
              }`}
            >
              S epoxidovou pryskyřicí
            </button>
            <button
              type="button"
              onClick={() => setCfg((c) => ({ ...c, noResin: true }))}
              className={`rounded-full border px-[22px] py-2.5 text-[13.5px] transition-colors ${
                cfg.noResin ? "border-ink bg-ink text-page" : "border-border-2 bg-surface text-ink"
              }`}
            >
              Čisté dřevo, bez pryskyřice
            </button>
          </div>
        </div>

        {!cfg.noResin && (
          <div>
            <div className="mb-3 text-xs tracking-[0.18em] text-brown-link">ODSTÍN PRYSKYŘICE</div>
            <PigmentPicker
              pigments={pigments}
              value={pigment}
              onChange={(label) => setCfg((c) => ({ ...c, resin: label }))}
            />
          </div>
        )}

        <div>
          <div className="mb-3 text-xs tracking-[0.18em] text-brown-link">TVAR</div>
          <div className="flex flex-wrap gap-2.5">
            {SHAPES.map((s) => {
              const active = cfg.shape === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCfg((c) => ({ ...c, shape: s }))}
                  className={`rounded-full border px-[22px] py-2.5 text-[13.5px] transition-colors ${
                    active ? "border-ink bg-ink text-page" : "border-border-2 bg-surface text-ink"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {!cfg.noResin && (
          <div>
            <div className="mb-3 text-xs tracking-[0.18em] text-brown-link">SMĚR ŘEKY</div>
            <div className="flex flex-wrap gap-2.5">
              {RIVERS.map((r) => {
                const active = cfg.river === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCfg((c) => ({ ...c, river: r }))}
                    className={`rounded-full border px-[22px] py-2.5 text-[13.5px] transition-colors ${
                      active ? "border-ink bg-ink text-page" : "border-border-2 bg-surface text-ink"
                    }`}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="mb-3 text-xs tracking-[0.18em] text-brown-link">ROZMĚR NA MÍRU</div>
          <input
            type="text"
            value={cfg.size}
            onChange={(e) => setCfg((c) => ({ ...c, size: e.target.value }))}
            placeholder="např. 200 × 100 × 4 cm"
            className="w-full rounded-xl border border-border-2 bg-white px-4 py-[13px] text-sm focus:border-teal focus:outline-none"
          />
          <p className="mt-2 text-xs text-faint">
            Zadejte délku × šířku (případně tloušťku). Rádi vyrobíme přesně na míru.
          </p>
        </div>

        <InquiryForm cfg={cfg} />
      </div>
    </div>

    <WoodGuide woods={woods} info={woodInfo} chosen={cfg.wood} onChoose={chooseWood} />
    </div>
  );
}

function Pips({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-[3px] align-middle" aria-label={`${value} z 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={`h-2 w-2 rounded-full ${i <= value ? "bg-amber" : "bg-border-2"}`} />
      ))}
    </span>
  );
}

/** "Naše dřeva": a tab per wood with a real photo and what the wood is like. Follows the chosen wood. */
function WoodGuide({
  woods,
  info: allInfo,
  chosen,
  onChoose,
}: {
  woods: WoodId[];
  info: Record<WoodId, WoodInfo>;
  chosen: WoodId;
  onChoose: (w: WoodId) => void;
}) {
  const [shown, setShown] = useState<WoodId>(chosen);
  const tabs = useRef<Partial<Record<WoodId, HTMLButtonElement | null>>>({});
  useEffect(() => setShown(chosen), [chosen]);
  const info = allInfo[shown];

  const onKey = (e: ReactKeyboardEvent<HTMLButtonElement>, w: WoodId) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    const next = woods[(woods.indexOf(w) + step + woods.length) % woods.length];
    setShown(next);
    tabs.current[next]?.focus();
  };

  return (
    <section aria-labelledby="wood-guide-title" className="mt-16 border-t border-border-2 pt-10 sm:mt-20 sm:pt-12">
      <p className="font-mono text-xs tracking-[0.28em] text-amber">NAŠE DŘEVA</p>
      <h2 id="wood-guide-title" className="mt-3 font-display text-[32px] font-medium sm:text-[40px]">
        Které dřevo je pro vás?
      </h2>

      <div role="tablist" aria-labelledby="wood-guide-title" className="mt-6 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-border-2 [scrollbar-width:none]">
        {woods.map((w) => {
          const on = w === shown;
          return (
            <button
              key={w}
              ref={(el) => {
                tabs.current[w] = el;
              }}
              type="button"
              role="tab"
              id={`wood-tab-${w}`}
              aria-selected={on}
              aria-controls="wood-guide-panel"
              tabIndex={on ? 0 : -1}
              onClick={() => setShown(w)}
              onKeyDown={(e) => onKey(e, w)}
              className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-2.5 py-3 text-[13px] transition-colors sm:px-[18px] sm:text-sm ${
                on ? "border-ink font-medium text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <span className="h-3 w-3 rounded-full" style={{ background: WOOD_SWATCHES[w] }} />
              {WOOD_LABELS[w]}
              {w === chosen && <span className="text-[11px] font-semibold text-teal">✓</span>}
            </button>
          );
        })}
      </div>

      <div
        key={shown}
        id="wood-guide-panel"
        role="tabpanel"
        aria-labelledby={`wood-tab-${shown}`}
        className="card-in grid grid-cols-1 items-center gap-6 pt-7 md:grid-cols-[1fr_1.1fr] md:gap-12"
      >
        <img
          src={info.photo ?? `/drevo/${shown}.jpg`}
          alt={`Vzorek dřeva: ${WOOD_LABELS[shown]}`}
          width={640}
          height={400}
          loading="lazy"
          className="aspect-[16/9] w-full rounded-[20px] object-cover md:aspect-[16/10]"
        />
        <div>
          <h3 className="font-display text-[38px] leading-none">{WOOD_LABELS[shown]}</h3>
          <p className="mt-1 text-xs italic text-amber">{info.latin}</p>
          <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-body">{info.description}</p>
          <dl className="mt-4 grid max-w-[460px] grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13.5px]">
            <dt className="text-faint">Barva</dt>
            <dd>{info.color}</dd>
            <dt className="text-faint">Kresba</dt>
            <dd>{info.grain}</dd>
            <dt className="text-faint">Tvrdost</dt>
            <dd>
              <Pips value={info.hardness} />
            </dd>
            <dt className="text-faint">Hodí se pro</dt>
            <dd>{info.bestFor}</dd>
          </dl>
          <div className="mt-5">
            {shown === chosen ? (
              <span className="text-[13px] text-teal">✓ Toto dřevo máte vybrané</span>
            ) : (
              <button
                type="button"
                onClick={() => onChoose(shown)}
                className="rounded-full border border-ink px-5 py-2 text-[13px] transition-colors hover:bg-ink hover:text-page"
              >
                Vybrat {WOOD_LABELS[shown].toLowerCase()}
              </button>
            )}
          </div>
          {/* the bundled sample photos must be credited; the owner's own photos need no credit */}
          {!info.photo && (
            <p className="mt-4 text-[11px] text-faint">
              Foto: Achim Raschka,{" "}
              <a
                href={`https://commons.wikimedia.org/wiki/File:${WOOD_PHOTO_SOURCE[shown]}`}
                target="_blank"
                rel="noopener"
                className="underline"
              >
                Wikimedia Commons
              </a>
              , CC BY-SA 3.0
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

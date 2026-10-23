import { useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import type { ColorOption } from "../lib/content";
import { submitInquiry } from "../lib/inquiries";

const SHAPES = ["Obdélník", "Oválné", "Čtverec", "Kulaté"] as const;
const RIVERS = ["Podél", "Napříč", "Diagonálně", "U kraje"] as const;

type Shape = (typeof SHAPES)[number];
type River = (typeof RIVERS)[number];

const RADIUS_MAP: Record<Shape, string> = {
  Obdélník: "14px",
  Oválné: "150px / 110px",
  Čtverec: "14px",
  Kulaté: "50%",
};

const RIVER_POS: Record<River, CSSProperties> = {
  Podél: { top: "-8%", bottom: "-8%", left: "39%", width: "22%", transform: "rotate(2deg)" },
  Napříč: { left: "-8%", right: "-8%", top: "38%", height: "26%", transform: "rotate(-1.5deg)" },
  Diagonálně: { left: "-14%", right: "-14%", top: "37%", height: "28%", transform: "rotate(31deg) scale(1.35)" },
  "U kraje": { top: "-8%", bottom: "-8%", left: "17%", width: "19%", transform: "rotate(3deg)" },
};

function shade(hex: string, amt: number, alpha?: number): string {
  const h = (hex || "#000000").replace("#", "");
  let r = parseInt(h.substring(0, 2), 16);
  let g = parseInt(h.substring(2, 4), 16);
  let b = parseInt(h.substring(4, 6), 16);
  r = Math.max(0, Math.min(255, Math.round(r + amt)));
  g = Math.max(0, Math.min(255, Math.round(g + amt)));
  b = Math.max(0, Math.min(255, Math.round(b + amt)));
  return alpha == null ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
}

interface Config {
  wood: string;
  resin: string;
  /** true = solid wood, no epoxy river at all */
  noResin: boolean;
  shape: Shape;
  size: string;
  river: River;
}

type Species = "orech" | "dub" | "jasan" | "briza" | "other";

/** Which kind of wood a swatch label means; unknown names still get a neutral grain. */
function speciesOf(label: string): Species {
  const l = label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (l.includes("orech")) return "orech";
  if (l.includes("dub")) return "dub";
  if (l.includes("jasan")) return "jasan";
  if (l.includes("briz")) return "briza";
  return "other";
}

interface Grain {
  /** feTurbulence base frequency "x y": low x + high y = long streaks along the board */
  freq: string;
  octaves: number;
  seed: number;
  /** how strong the dark growth rings are (0..1) */
  dark: number;
  /** how strong the light streaks are (0..1) */
  light: number;
  /** wavy-ness of the rings */
  swirl: number;
  /** fine pores / medullary flecks */
  pores: number;
  /** base colour pushed darker (negative) or lighter (positive) so the texture sits well on it */
  tone: number;
}

const GRAINS: Record<Species, Grain> = {
  orech: { freq: "0.0035 0.085", octaves: 5, seed: 7, dark: 0.62, light: 0.28, swirl: 26, pores: 0.18, tone: -6 },
  dub: { freq: "0.0055 0.15", octaves: 5, seed: 3, dark: 0.5, light: 0.34, swirl: 12, pores: 0.4, tone: 0 },
  jasan: { freq: "0.004 0.24", octaves: 4, seed: 11, dark: 0.34, light: 0.32, swirl: 8, pores: 0.12, tone: 4 },
  briza: { freq: "0.008 0.36", octaves: 4, seed: 5, dark: 0.22, light: 0.26, swirl: 5, pores: 0.1, tone: 6 },
  other: { freq: "0.005 0.16", octaves: 5, seed: 9, dark: 0.42, light: 0.3, swirl: 12, pores: 0.2, tone: 0 },
};

/** Wood grain painted with SVG noise, tinted by the swatch colour: looks like real boards, no image files. */
function WoodGrain({ species, color, uid }: { species: Species; color: string; uid: string }) {
  const g = GRAINS[species];
  const base = shade(color, g.tone);
  return (
    <svg
      viewBox="0 0 300 300"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      style={{ position: "absolute", inset: 0, display: "block" }}
      aria-hidden="true"
    >
      <defs>
        {/* dark growth rings: noise stretched along the board, gently bent */}
        <filter id={`${uid}-dark`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={g.freq} numOctaves={g.octaves} seed={g.seed} result="n" />
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={2} seed={g.seed + 4} result="bend" />
          <feDisplacementMap in="n" in2="bend" scale={g.swirl} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feColorMatrix
            in="d"
            type="matrix"
            values="0 0 0 0 0.08  0 0 0 0 0.04  0 0 0 0 0.01  0 0 0 3.4 -1.55"
          />
        </filter>
        {/* light streaks between the rings */}
        <filter id={`${uid}-light`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={g.freq} numOctaves={g.octaves} seed={g.seed + 21} result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 1  0 0 0 0 0.93  0 0 0 0 0.78  0 0 0 3 -1.7"
          />
        </filter>
        {/* tiny pores, short dashes along the grain */}
        <filter id={`${uid}-pores`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.045 0.9" numOctaves={2} seed={g.seed + 40} result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.05  0 0 0 0 0.02  0 0 0 0 0  0 0 0 5 -2.9"
          />
        </filter>
        <linearGradient id={`${uid}-light-fall`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill={base} />
      <rect width="300" height="300" filter={`url(#${uid}-dark)`} opacity={g.dark} />
      <rect width="300" height="300" filter={`url(#${uid}-light)`} opacity={g.light} />
      <rect width="300" height="300" filter={`url(#${uid}-pores)`} opacity={g.pores} />
      <rect width="300" height="300" fill={`url(#${uid}-light-fall)`} />
    </svg>
  );
}

const SLAB_LAYERS = 8;

function TablePreview({
  cfg,
  woodColor,
  resinColor,
}: {
  cfg: Config;
  woodColor: string;
  resinColor: string;
}) {
  const radius = RADIUS_MAP[cfg.shape];
  const isSquareish = cfg.shape === "Kulaté" || cfg.shape === "Čtverec";
  const topW = isSquareish ? 210 : 300;
  const topH = isSquareish ? 210 : 172;
  const species = speciesOf(cfg.wood);
  const uid = `w${species}`;

  const tableGroupStyle: CSSProperties = {
    position: "relative",
    width: topW + "px",
    height: topH + "px",
    transformStyle: "preserve-3d",
    transform: "rotateX(53deg) rotateZ(-2deg)",
    transition: "width .5s ease, height .5s ease",
    marginTop: "-26px",
  };

  const topSurfaceStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: radius,
    overflow: "hidden",
    transition: "border-radius .5s ease",
    boxShadow: "inset 0 2px 5px rgba(255,255,255,.26), inset 0 -3px 10px rgba(0,0,0,.28)",
    transform: "translateZ(0.5px)",
  };

  const floorShadowStyle: CSSProperties = {
    position: "absolute",
    bottom: "40px",
    left: "50%",
    width: topW * 1.02 + "px",
    height: "40px",
    transform: "translateX(-50%)",
    borderRadius: "50%",
    background: "radial-gradient(closest-side, rgba(0,0,0,.4), rgba(0,0,0,.18) 55%, transparent)",
    filter: "blur(9px)",
    transition: "width .5s ease",
  };

  const rLight = shade(resinColor, 70, 0.92);
  const rMid = shade(resinColor, 6, 0.96);
  const rDark = shade(resinColor, -46, 0.98);
  const riverBg = [
    "linear-gradient(118deg, rgba(255,255,255,.5) 0%, transparent 20%)",
    "linear-gradient(300deg, rgba(255,255,255,.18) 0%, transparent 34%)",
    `linear-gradient(118deg, ${rLight} 0%, ${rMid} 46%, ${rDark} 100%)`,
  ].join(",");
  const riverShadow = `inset 0 0 26px rgba(0,0,0,.4), inset 0 3px 8px rgba(255,255,255,.35), 0 0 20px ${shade(resinColor, -10, 0.45)}`;

  const riverStyle: CSSProperties = {
    position: "absolute",
    background: riverBg,
    boxShadow: riverShadow,
    filter: "blur(.3px)",
    transition: "all .5s ease",
    borderRadius: "40% 60% 45% 55% / 50%",
    overflow: "hidden",
    ...RIVER_POS[cfg.river],
  };

  const glossStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: "linear-gradient(115deg, rgba(255,255,255,.2), transparent 42%)",
  };

  return (
    <div
      style={{
        position: "relative",
        width: "420px",
        maxWidth: "100%",
        height: "340px",
        perspective: "1300px",
        perspectiveOrigin: "50% 34%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}
    >
      <div style={floorShadowStyle} />
      <div className="table-float">
        <div style={tableGroupStyle}>
          {/* the board's thickness: a stack of slightly darker copies underneath the top */}
          {Array.from({ length: SLAB_LAYERS }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: radius,
                transform: `translateZ(${-(i + 1) * 2}px)`,
                background: shade(woodColor, -34 - i * 4),
                transition: "border-radius .5s ease",
              }}
            />
          ))}
          <div style={topSurfaceStyle}>
            {/* remounted on every wood change, so the new grain fades in */}
            <div key={`${cfg.wood}-${woodColor}`} className="wood-fade" style={{ position: "absolute", inset: 0 }}>
              <WoodGrain species={species} color={woodColor} uid={uid} />
            </div>
            {!cfg.noResin && (
              <div style={riverStyle}>
                <div className="resin-sheen" />
              </div>
            )}
            <div style={glossStyle} />
          </div>
        </div>
      </div>
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
        wood: cfg.wood,
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

export default function Configurator({
  woods,
  resins,
}: {
  woods: ColorOption[];
  resins: ColorOption[];
}) {
  const [cfg, setCfg] = useState<Config>({
    wood: woods[0].label,
    resin: resins[0].label,
    noResin: false,
    shape: "Obdélník",
    size: "",
    river: "Podél",
  });

  const woodColor = (woods.find((w) => w.label === cfg.wood) ?? woods[0]).color;
  const resinColor = (resins.find((r) => r.label === cfg.resin) ?? resins[0]).color;

  const summary = useMemo(
    () => ({
      line1: cfg.noResin
        ? `${cfg.wood} · čisté dřevo, bez pryskyřice`
        : `${cfg.wood} · ${cfg.resin} · řeka ${cfg.river}`,
      line2: `${cfg.shape} · ${cfg.size || "rozměr neuveden"}`,
    }),
    [cfg]
  );

  return (
    <div className="grid grid-cols-1 items-start gap-9 md:grid-cols-[1fr_0.9fr]">
      <div className="md:sticky md:top-[100px]">
        <div className="flex min-h-[460px] items-center justify-center rounded-[26px] bg-warm px-6 py-14 sm:px-10">
          <TablePreview cfg={cfg} woodColor={woodColor} resinColor={resinColor} />
        </div>
        <p className="mt-4 whitespace-pre-line text-center font-mono text-[11px] leading-relaxed text-faint">
          {summary.line1}
          {"\n"}
          {summary.line2}
        </p>
      </div>

      <div className="flex flex-col gap-7">
        <div>
          <div className="mb-3 text-xs tracking-[0.18em] text-brown-link">DŘEVO</div>
          <div className="flex flex-wrap gap-2.5">
            {woods.map((w) => {
              const active = cfg.wood === w.label;
              return (
                <button
                  key={w.label}
                  type="button"
                  onClick={() => setCfg((c) => ({ ...c, wood: w.label }))}
                  className={`flex items-center gap-2.5 rounded-full border px-[15px] py-[9px] text-[13px] transition-colors ${
                    active ? "border-ink bg-footer" : "border-border-2 bg-surface"
                  }`}
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: w.color }} />
                  {w.label}
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
            <div className="flex flex-wrap gap-2.5">
              {resins.map((r) => {
                const active = cfg.resin === r.label;
                return (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setCfg((c) => ({ ...c, resin: r.label }))}
                    className={`flex items-center gap-2.5 rounded-full border px-[15px] py-[9px] text-[13px] transition-colors ${
                      active ? "border-ink bg-footer" : "border-border-2 bg-surface"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full" style={{ background: r.color }} />
                    {r.label}
                  </button>
                );
              })}
            </div>
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
  );
}

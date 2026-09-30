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

  const grainHi = shade(woodColor, 34, 0.5);
  const grainLo = shade(woodColor, -40, 0.55);

  const tableGroupStyle: CSSProperties = {
    position: "relative",
    width: topW + "px",
    height: topH + "px",
    transformStyle: "preserve-3d",
    transform: "rotateX(53deg) rotateZ(-2deg)",
    transition: "all .5s ease",
    marginTop: "-26px",
  };

  const topSurfaceStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: radius,
    overflow: "hidden",
    boxShadow: "inset 0 2px 5px rgba(255,255,255,.22), inset 0 -3px 10px rgba(0,0,0,.25)",
    background: [
      `repeating-linear-gradient(1.5deg, ${grainLo} 0px, ${grainLo} 1px, transparent 1px, transparent 5px)`,
      `repeating-linear-gradient(1.5deg, ${grainHi} 0px, ${grainHi} 1px, transparent 1px, transparent 11px)`,
      `repeating-linear-gradient(179deg, rgba(0,0,0,.05) 0px, rgba(0,0,0,.05) 2px, transparent 2px, transparent 16px)`,
      `radial-gradient(120% 140% at 24% 0%, ${shade(woodColor, 28)}, transparent 55%)`,
      `linear-gradient(160deg, ${shade(woodColor, 18)}, ${shade(woodColor, -22)})`,
    ].join(","),
  };

  const undersideStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: radius,
    transform: "translateZ(-16px)",
    background: `linear-gradient(160deg, ${shade(woodColor, -26)}, ${shade(woodColor, -52)})`,
    boxShadow: "0 0 0 1px rgba(0,0,0,.15)",
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
    ...RIVER_POS[cfg.river],
  };

  const glossStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background: "linear-gradient(115deg, rgba(255,255,255,.22), transparent 42%)",
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
      <div style={tableGroupStyle}>
        <div style={undersideStyle} />
        <div style={topSurfaceStyle}>
          {!cfg.noResin && <div style={riverStyle} />}
          <div style={glossStyle} />
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

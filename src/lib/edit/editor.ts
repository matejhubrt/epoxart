/**
 * In-page editor for the site owner.
 *
 * Loaded only when a Supabase login session exists in the browser (see Layout.astro), so
 * ordinary visitors never download it. It then checks the admin allow-list and, in edit
 * mode, turns the real website into its own editor:
 *   - every element marked `data-edit-text="key"` becomes click-to-type,
 *   - every element marked `data-edit-image="key"` gets a "change photo" button,
 *   - a bar at the bottom saves everything to Supabase (row-level security still decides
 *     who may write, so this file is convenience, not security).
 */
import { getSupabase } from "../supabase";
import { checkIsAdmin, fetchContent, saveSetting } from "../admin/api";
import { removeImageByUrl, uploadImage } from "../admin/media";
import { CATEGORY_KEYS, type CategoryKey } from "../products";
import type { SiteImages, SiteTexts } from "../content";

const FLAG = "epoxart-edit";

const norm = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

function readFlag(): boolean {
  try {
    return sessionStorage.getItem(FLAG) === "1";
  } catch {
    return false;
  }
}

function writeFlag(on: boolean) {
  try {
    if (on) sessionStorage.setItem(FLAG, "1");
    else sessionStorage.removeItem(FLAG);
  } catch {
    /* private mode: edit mode simply will not survive navigation */
  }
}

function plural(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

// ---- photo keys <-> SiteImages ---------------------------------------------------------

function imageUrlFor(images: SiteImages, key: string): string | null {
  if (key === "hero") return images.hero;
  if (key === "about") return images.about;
  if (key.startsWith("cat:")) return images.categories[key.slice(4) as CategoryKey] ?? null;
  if (key.startsWith("insta:")) return images.instagram[Number(key.slice(6))] ?? null;
  return null;
}

function withImage(images: SiteImages, key: string, url: string): SiteImages {
  const next: SiteImages = {
    ...images,
    categories: { ...images.categories },
    instagram: [...images.instagram],
  };
  if (key === "hero") next.hero = url;
  else if (key === "about") next.about = url;
  else if (key.startsWith("cat:")) {
    const k = key.slice(4);
    if ((CATEGORY_KEYS as string[]).includes(k)) next.categories[k as CategoryKey] = url;
  } else if (key.startsWith("insta:")) {
    const n = Number(key.slice(6));
    if (Number.isInteger(n) && n >= 0 && n < next.instagram.length) next.instagram[n] = url;
  }
  return next;
}

function urlsOf(images: SiteImages): string[] {
  return [
    images.hero,
    images.about,
    ...CATEGORY_KEYS.map((k) => images.categories[k]),
    ...images.instagram,
  ].filter((u): u is string => !!u);
}

// ---- styles ------------------------------------------------------------------------------

const CSS = `
.ea-on [data-edit-text]{cursor:text;outline:2px dashed rgba(31,110,99,.38);outline-offset:5px;border-radius:4px;transition:outline-color .15s}
.ea-on [data-edit-text]:hover{outline-color:rgba(31,110,99,.95)}
.ea-on [data-edit-text]:focus{outline:2px solid #1f6e63}
.ea-on [data-edit-text]:empty::before{content:"(prázdné – klikněte a napište text)";opacity:.55}
.ea-on [data-edit-text].ea-changed{outline-color:rgba(200,138,58,.9)}
.ea-on [data-edit-image]{cursor:pointer}
.ea-badge{position:absolute;top:12px;right:12px;z-index:30;display:inline-flex;align-items:center;gap:6px;border:0;border-radius:999px;background:#2b2420;color:#faf7f1;padding:9px 16px;font:500 13px/1 "Space Grotesk",system-ui,sans-serif;letter-spacing:.02em;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.28)}
.ea-badge:hover{background:#1f6e63}
.ea-badge[disabled]{opacity:.7;cursor:progress}
.ea-fill{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.ea-bar{position:fixed;left:0;right:0;margin-inline:auto;width:fit-content;bottom:16px;z-index:1000;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px 12px;max-width:calc(100vw - 24px);border-radius:26px;background:#2b2420;color:#faf7f1;padding:10px 14px 10px 20px;font:400 13px/1.3 "Space Grotesk",system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.35)}
.ea-bar a{color:#d8c9b0;text-decoration:underline;text-underline-offset:3px}
.ea-title{font-weight:600;letter-spacing:.04em}
.ea-status{opacity:.85;min-width:120px}
.ea-btn{border:1px solid rgba(250,247,241,.35);border-radius:999px;background:transparent;color:#faf7f1;padding:8px 16px;font:inherit;cursor:pointer;white-space:nowrap}
.ea-btn:hover:not([disabled]){border-color:#faf7f1}
.ea-btn[disabled]{opacity:.45;cursor:not-allowed}
.ea-btn.ea-primary{background:#1f6e63;border-color:#1f6e63}
.ea-btn.ea-primary:hover:not([disabled]){background:#2a8576}
.ea-pill{position:fixed;right:16px;bottom:16px;z-index:1000;border:0;border-radius:999px;background:#2b2420;color:#faf7f1;padding:11px 18px;font:500 13px/1 "Space Grotesk",system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 24px rgba(0,0,0,.3);opacity:.92}
.ea-pill:hover{background:#1f6e63;opacity:1}
`;

function injectStyles() {
  if (document.getElementById("ea-style")) return;
  const style = document.createElement("style");
  style.id = "ea-style";
  style.textContent = CSS;
  document.head.append(style);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<HTMLElementTagNameMap[K]> & { className?: string } = {},
  text?: string
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  Object.assign(node, props);
  node.setAttribute("data-edit-ui", "");
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---- entry point -------------------------------------------------------------------------

export async function initEditor(): Promise<void> {
  try {
    if (document.body.dataset.bare === "1") return;
    const supabase = getSupabase();
    if (!supabase) return;
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    if (!(await checkIsAdmin())) return;

    // "?upravy=1" is the link used by the admin page to jump straight into edit mode
    const url = new URL(location.href);
    if (url.searchParams.has("upravy")) {
      writeFlag(true);
      url.searchParams.delete("upravy");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }

    injectStyles();
    if (readFlag()) startEditing();
    else showEntryPill();
  } catch (e) {
    console.warn("[editor] not started:", e);
  }
}

function showEntryPill() {
  const pill = el("button", { type: "button", className: "ea-pill" }, "✎ Upravit web");
  pill.addEventListener("click", () => {
    pill.remove();
    writeFlag(true);
    startEditing();
  });
  document.body.append(pill);
}

// ---- the editor --------------------------------------------------------------------------

export function startEditing() {
  injectStyles();
  document.documentElement.classList.add("ea-on");
  let saving = false;
  let leaving = false; // set right before a deliberate reload, so no "unsaved changes" warning appears

  /* ---------- texts ---------- */
  const textEls = Array.from(document.querySelectorAll<HTMLElement>("[data-edit-text]"));
  const textKeys = Array.from(new Set(textEls.map((n) => n.dataset.editText!)));
  const origTexts = new Map<string, string>();
  for (const n of textEls) {
    const key = n.dataset.editText!;
    if (!origTexts.has(key)) origTexts.set(key, norm(n.textContent));
  }

  const changedTexts = (): Partial<SiteTexts> => {
    const out: Record<string, string> = {};
    for (const key of textKeys) {
      const first = textEls.find((n) => n.dataset.editText === key)!;
      const now = norm(first.textContent);
      if (now !== origTexts.get(key)) out[key] = now;
    }
    return out as Partial<SiteTexts>;
  };

  for (const n of textEls) {
    n.contentEditable = "plaintext-only";
    if (n.contentEditable !== "plaintext-only") n.contentEditable = "true";
    n.spellcheck = true;
    n.setAttribute("role", "textbox");

    n.addEventListener("keydown", (e) => {
      // one paragraph = one text, so Enter just finishes editing
      if (e.key === "Enter") {
        e.preventDefault();
        n.blur();
      }
    });
    n.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = (e.clipboardData?.getData("text/plain") ?? "").replace(/\s+/g, " ");
      document.execCommand("insertText", false, text);
    });
    n.addEventListener("input", () => {
      // the same text can appear twice on a page (e.g. footer + body): keep copies in sync
      const key = n.dataset.editText!;
      for (const other of textEls) {
        if (other !== n && other.dataset.editText === key) other.textContent = n.textContent;
      }
      refreshChangedMarks();
      updateBar();
    });
    n.addEventListener("blur", () => {
      const clean = norm(n.textContent);
      if (clean !== n.textContent) n.textContent = clean;
    });
  }

  function refreshChangedMarks() {
    const changed = changedTexts() as Record<string, string>;
    for (const n of textEls) n.classList.toggle("ea-changed", n.dataset.editText! in changed);
  }

  /* ---------- photos ---------- */
  const imageEls = Array.from(document.querySelectorAll<HTMLElement>("[data-edit-image]"));
  /** key -> public URL of the photo uploaded in this editing session (not saved yet) */
  const imageChanges = new Map<string, string>();
  const picker = el("input", { type: "file", accept: "image/*", className: "" });
  picker.style.display = "none";
  document.body.append(picker);
  let pickFor: { key: string; badge: HTMLButtonElement } | null = null;

  function showPhoto(target: HTMLElement, url: string) {
    if (target instanceof HTMLImageElement) {
      target.removeAttribute("srcset");
      target.src = url;
      return;
    }
    // placeholder pattern: lay the real photo over it
    let img = target.querySelector<HTMLImageElement>(":scope > img.ea-fill");
    if (!img) {
      img = document.createElement("img");
      img.className = "ea-fill";
      img.alt = "";
      target.append(img);
    }
    img.src = url;
  }

  picker.addEventListener("change", async () => {
    const file = picker.files?.[0];
    const ctx = pickFor;
    picker.value = "";
    if (!file || !ctx) return;
    const { key, badge } = ctx;
    const label = badge.textContent;
    badge.disabled = true;
    badge.textContent = "Nahrávám…";
    try {
      const url = await uploadImage("site", file);
      const earlier = imageChanges.get(key);
      if (earlier) void removeImageByUrl(earlier); // replaced again before saving
      imageChanges.set(key, url);
      for (const target of imageEls) {
        if (target.dataset.editImage === key) showPhoto(target, url);
      }
      updateBar();
    } catch (e) {
      say(e instanceof Error ? e.message : "Nahrání se nezdařilo.", true);
    } finally {
      badge.disabled = false;
      badge.textContent = label;
    }
  });

  for (const target of imageEls) {
    const key = target.dataset.editImage!;
    const parent = target.parentElement;
    if (!parent) continue;
    if (getComputedStyle(parent).position === "static") parent.style.position = "relative";

    const badge = el("button", { type: "button", className: "ea-badge" }, "📷 Změnit fotku");
    parent.append(badge);

    const open = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      pickFor = { key, badge };
      picker.click();
    };
    badge.addEventListener("click", open);
    target.addEventListener("click", open);
  }

  /* ---------- links that contain something editable must not navigate away ---------- */
  const onClickCapture = (e: MouseEvent) => {
    const t = e.target as HTMLElement | null;
    const link = t?.closest("a");
    if (link && link.querySelector("[data-edit-text],[data-edit-image]") && !t?.closest("[data-edit-ui]")) {
      e.preventDefault();
    }
  };
  document.addEventListener("click", onClickCapture, true);

  /* ---------- bar ---------- */
  const bar = el("div", { className: "ea-bar" });
  const title = el("span", { className: "ea-title" }, "✎ Režim úprav");
  const status = el("span", { className: "ea-status" });
  status.setAttribute("aria-live", "polite");
  const adminLink = el("a", { href: "/admin" }, "Administrace");
  const discardBtn = el("button", { type: "button", className: "ea-btn" }, "Zahodit");
  const saveBtn = el("button", { type: "button", className: "ea-btn ea-primary" }, "Uložit změny");
  const doneBtn = el("button", { type: "button", className: "ea-btn" }, "Hotovo");
  bar.append(title, status, adminLink, discardBtn, saveBtn, doneBtn);
  document.body.append(bar);

  const HINT = "Klikněte na text a pište, nebo na fotku a vyberte novou.";
  let message: { text: string; error: boolean } | null = null;

  function changeCount(): number {
    return Object.keys(changedTexts()).length + imageChanges.size;
  }

  function updateBar() {
    const n = changeCount();
    saveBtn.disabled = saving || n === 0;
    discardBtn.disabled = saving || n === 0;
    status.style.color = "";
    if (saving) status.textContent = "Ukládám…";
    else if (n > 0) status.textContent = `${n} ${plural(n, "neuložená změna", "neuložené změny", "neuložených změn")}`;
    else if (message) {
      status.textContent = message.text;
      if (message.error) status.style.color = "#f0b4a4";
    } else status.textContent = HINT;
  }

  function say(text: string, error = false) {
    message = { text, error };
    updateBar();
  }

  async function save() {
    if (saving || changeCount() === 0) return;
    saving = true;
    message = null;
    updateBar();
    try {
      const fresh = await fetchContent();
      const texts = changedTexts();
      if (Object.keys(texts).length > 0) {
        await saveSetting("texts", { ...fresh.texts, ...texts });
      }
      if (imageChanges.size > 0) {
        let images = fresh.images;
        for (const [key, url] of imageChanges) images = withImage(images, key, url);
        await saveSetting("images", images);
        // photos that are no longer used anywhere can be deleted from storage
        const stillUsed = new Set(urlsOf(images));
        await Promise.all(
          urlsOf(fresh.images)
            .filter((u) => !stillUsed.has(u))
            .map((u) => removeImageByUrl(u))
        );
      }
      for (const [key, value] of Object.entries(texts)) origTexts.set(key, value as string);
      imageChanges.clear();
      refreshChangedMarks();
      saving = false;
      say("Uloženo. Na webu se změny objeví do několika sekund.");
    } catch (e) {
      saving = false;
      say(e instanceof Error ? e.message : "Uložení se nezdařilo.", true);
    }
  }

  function discard() {
    if (changeCount() === 0) return;
    if (!window.confirm("Zahodit všechny neuložené změny?")) return;
    // photos uploaded during this session are not needed any more
    for (const url of imageChanges.values()) void removeImageByUrl(url);
    imageChanges.clear();
    leaving = true;
    location.reload(); // shows the saved state again
  }

  function stop() {
    if (changeCount() > 0 && !window.confirm("Máte neuložené změny. Opravdu skončit bez uložení?")) return;
    for (const url of imageChanges.values()) void removeImageByUrl(url);
    writeFlag(false);
    leaving = true;
    location.reload(); // simplest way back to the plain public page
  }

  saveBtn.addEventListener("click", save);
  discardBtn.addEventListener("click", discard);
  doneBtn.addEventListener("click", stop);

  const onKey = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      void save();
    }
  };
  document.addEventListener("keydown", onKey);

  const onBeforeUnload = (e: BeforeUnloadEvent) => {
    if (leaving || changeCount() === 0) return;
    e.preventDefault();
    e.returnValue = "";
  };
  window.addEventListener("beforeunload", onBeforeUnload);

  updateBar();
}

import { getSupabase } from "../supabase";
import { mergeContent, rowToProduct, type SiteContent } from "../content";
import type { CategoryKey, Product } from "../products";
import { removeImageByUrl } from "./media";

export interface AdminProduct extends Product {
  visible: boolean;
  sortOrder: number;
}

export interface Inquiry {
  id: string;
  kind: "contact" | "custom";
  name: string;
  email: string;
  subject: string | null;
  message: string | null;
  config: Record<string, string> | null;
  isRead: boolean;
  createdAt: string;
}

export interface ProductDraft {
  id?: string;
  name: string;
  cat: CategoryKey;
  desc: string;
  price: number | null;
  image: string | null;
  visible: boolean;
}

function db() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Databáze není nastavena.");
  return supabase;
}

function fail(error: { message: string } | null, what: string): void {
  if (error) throw new Error(`${what}: ${error.message}`);
}

/** True when the logged-in user is on the admin allow-list. */
export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await db().rpc("is_admin");
  if (error) return false;
  return data === true;
}

// ---- products ---------------------------------------------------------------

export async function fetchProducts(): Promise<AdminProduct[]> {
  const { data, error } = await db()
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  fail(error, "Produkty se nepodařilo načíst");
  return (data ?? []).map((r) => ({
    ...rowToProduct(r),
    visible: r.visible !== false,
    sortOrder: Number(r.sort_order ?? 0),
  }));
}

export async function saveProduct(draft: ProductDraft, all: AdminProduct[]): Promise<void> {
  const fields = {
    name: draft.name.trim(),
    category: draft.cat,
    description: draft.desc.trim(),
    price: draft.price,
    image_url: draft.image,
    visible: draft.visible,
  };

  if (draft.id) {
    const previous = all.find((p) => p.id === draft.id);
    const { error } = await db().from("products").update(fields).eq("id", draft.id);
    fail(error, "Produkt se nepodařilo uložit");
    if (previous?.image && previous.image !== draft.image) await removeImageByUrl(previous.image);
  } else {
    const sortOrder = all.reduce((m, p) => Math.max(m, p.sortOrder), 0) + 10;
    const { error } = await db().from("products").insert({ ...fields, sort_order: sortOrder });
    fail(error, "Produkt se nepodařilo přidat");
  }
}

export async function setProductVisible(id: string, visible: boolean): Promise<void> {
  const { error } = await db().from("products").update({ visible }).eq("id", id);
  fail(error, "Změna se nepodařila");
}

export async function deleteProduct(product: AdminProduct): Promise<void> {
  const { error } = await db().from("products").delete().eq("id", product.id);
  fail(error, "Produkt se nepodařilo smazat");
  await removeImageByUrl(product.image);
}

/** Swap the position of two neighbouring products. */
export async function swapProducts(a: AdminProduct, b: AdminProduct): Promise<void> {
  // equal sort_order values would make a swap a no-op, so renumber if needed
  const [orderA, orderB] =
    a.sortOrder === b.sortOrder ? [b.sortOrder + 1, b.sortOrder] : [b.sortOrder, a.sortOrder];
  const first = await db().from("products").update({ sort_order: orderA }).eq("id", a.id);
  fail(first.error, "Změna pořadí se nepodařila");
  const second = await db().from("products").update({ sort_order: orderB }).eq("id", b.id);
  fail(second.error, "Změna pořadí se nepodařila");
}

// ---- site settings ------------------------------------------------------------

export async function fetchContent(): Promise<SiteContent> {
  const { data, error } = await db().from("site_settings").select("key, value");
  fail(error, "Nastavení se nepodařilo načíst");
  return mergeContent(data ?? []);
}

export async function saveSetting(
  key: "texts" | "images" | "shipping" | "configurator",
  value: unknown
): Promise<void> {
  const { error } = await db()
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  fail(error, "Uložení se nezdařilo");
}

// ---- inquiries ----------------------------------------------------------------

export async function fetchInquiries(): Promise<Inquiry[]> {
  const { data, error } = await db()
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(300);
  fail(error, "Poptávky se nepodařilo načíst");
  return (data ?? []).map((r) => ({
    id: String(r.id),
    kind: r.kind,
    name: String(r.name ?? ""),
    email: String(r.email ?? ""),
    subject: r.subject ?? null,
    message: r.message ?? null,
    config: r.config ?? null,
    isRead: r.is_read === true,
    createdAt: String(r.created_at),
  }));
}

export async function countUnread(): Promise<number> {
  const { count, error } = await db()
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("is_read", false);
  if (error) return 0;
  return count ?? 0;
}

export async function setInquiryRead(id: string, isRead: boolean): Promise<void> {
  const { error } = await db().from("inquiries").update({ is_read: isRead }).eq("id", id);
  fail(error, "Změna se nepodařila");
}

export async function deleteInquiry(id: string): Promise<void> {
  const { error } = await db().from("inquiries").delete().eq("id", id);
  fail(error, "Smazání se nepodařilo");
}

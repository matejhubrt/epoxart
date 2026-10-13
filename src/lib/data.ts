import { DEFAULT_CONTENT, mergeContent, rowToProduct, type SiteData } from "./content";
import { assignSlugs, DEFAULT_PRODUCTS } from "./products";
import { getSupabase } from "./supabase";

const TTL_MS = 10_000;
let cached: { at: number; data: SiteData } | null = null;

const FALLBACK: SiteData = { products: DEFAULT_PRODUCTS, content: DEFAULT_CONTENT };

/**
 * Everything the public pages need, read from Supabase.
 * Cached for a few seconds so Layout + page + footer share a single round trip.
 * If the database is not configured or unreachable the site keeps working with the built-in defaults.
 */
export async function getSiteData(): Promise<SiteData> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.data;

  const supabase = getSupabase();
  if (!supabase) return FALLBACK;

  try {
    const [products, settings] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("visible", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
      supabase.from("site_settings").select("key, value"),
    ]);
    if (products.error) throw products.error;
    if (settings.error) throw settings.error;

    const content = mergeContent(settings.data ?? []);
    const data: SiteData = {
      // products in a category the owner switched off are not shown anywhere on the public site
      // slugs are assigned on the full visible list, so an address never changes because
      // a category was switched off and on
      products: assignSlugs((products.data ?? []).map(rowToProduct)).filter(
        (p) => !content.categories.hidden.includes(p.cat)
      ),
      content,
    };
    cached = { at: Date.now(), data };
    return data;
  } catch (err) {
    console.error("[getSiteData] falling back to defaults:", err);
    return FALLBACK;
  }
}

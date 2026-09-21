import { getSupabase } from "./supabase";

export interface InquiryInput {
  kind: "contact" | "custom";
  name: string;
  email: string;
  subject?: string;
  message?: string;
  config?: Record<string, string>;
}

/**
 * Stores an inquiry so the owner can read it in the admin inbox.
 * While Supabase is not configured this is a no-op that reports success,
 * so the public forms behave exactly like the original prototype.
 */
export async function submitInquiry(input: InquiryInput): Promise<{ ok: boolean }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: true };

  const { error } = await supabase.from("inquiries").insert({
    kind: input.kind,
    name: input.name.trim().slice(0, 200),
    email: input.email.trim().slice(0, 320),
    subject: input.subject?.trim().slice(0, 300) || null,
    message: input.message?.trim().slice(0, 5000) || null,
    config: input.config ?? null,
  });
  if (error) {
    console.error("[submitInquiry]", error.message);
    return { ok: false };
  }
  return { ok: true };
}

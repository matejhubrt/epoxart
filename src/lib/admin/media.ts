import { getSupabase, MEDIA_BUCKET } from "../supabase";

const MAX_EDGE = 1800;

/** Shrinks a phone/camera photo to a web-friendly size and converts it to WebP (JPEG as a fallback). */
export async function prepareImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Prohlížeč nepodporuje úpravu obrázků.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (type: string, quality: number) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

  let blob = await toBlob("image/webp", 0.86);
  if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg", 0.88);
  if (!blob) throw new Error("Fotku se nepodařilo zpracovat.");
  return blob;
}

/** Uploads a photo and returns its public URL. `folder` just keeps the bucket tidy. */
export async function uploadImage(folder: string, file: File): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Databáze není nastavena.");
  if (!file.type.startsWith("image/")) throw new Error("Vyberte prosím obrázek (JPG, PNG nebo WebP).");

  const blob = await prepareImage(file);
  const ext = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Nahrání se nezdařilo: ${error.message}`);

  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}

const MARKER = `/storage/v1/object/public/${MEDIA_BUCKET}/`;

/** Best-effort cleanup of a photo we uploaded earlier; never throws. */
export async function removeImageByUrl(url: string | null | undefined): Promise<void> {
  const supabase = getSupabase();
  if (!supabase || !url) return;
  const i = url.indexOf(MARKER);
  if (i === -1) return;
  const path = decodeURIComponent(url.slice(i + MARKER.length).split("?")[0]);
  await supabase.storage.from(MEDIA_BUCKET).remove([path]).catch(() => undefined);
}

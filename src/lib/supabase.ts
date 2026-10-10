import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && anon);

let browserClient: SupabaseClient | null = null;

/** Singleton browser Supabase client (anon key). */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (typeof window === "undefined") {
    return createClient(url, anon);
  }
  if (!browserClient) {
    browserClient = createClient(url, anon);
  }
  return browserClient;
}

export type ChatMessage = {
  id: string;
  thread_id: string;
  sender_role: "buyer" | "admin";
  sender_name: string;
  body: string;
  created_at: string;
};

export type ChatThread = {
  id: string;
  buyer_name: string;
  buyer_email: string | null;
  last_message: string | null;
  updated_at: string;
  created_at: string;
};

/** Upload product image to Supabase Storage bucket `product-images`. Returns public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env."
    );
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `products/\( {Date.now()}- \){Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
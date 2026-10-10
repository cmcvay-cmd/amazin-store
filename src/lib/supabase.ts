import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseConfigured = Boolean(url && anon);

let browserClient: SupabaseClient | null = null;

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
  image_url?: string | null;
  created_at: string;
};

export type ChatThread = {
  id: string;
  buyer_name: string;
  buyer_email: string | null;
  user_id: string | null;
  order_ref: string | null;
  last_message: string | null;
  updated_at: string;
  created_at: string;
};

function safeExt(file: File): string {
  const raw = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const clean = raw.replace(/[^a-z0-9]/g, "");
  return clean || "jpg";
}

function uniquePath(folder: string, file: File): string {
  const ext = safeExt(file);
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return folder + "/" + stamp + "-" + rand + "." + ext;
}

async function uploadToBucket(
  bucket: string,
  folder: string,
  file: File
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel env."
    );
  }

  const path = uniquePath(folder, file);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadProductImage(file: File): Promise<string> {
  return uploadToBucket("product-images", "products", file);
}

export async function uploadChatImage(file: File): Promise<string> {
  return uploadToBucket("product-images", "chat", file);
}

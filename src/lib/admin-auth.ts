/**
 * Admin PIN — prefer Vercel env `NEXT_PUBLIC_ADMIN_PIN`.
 * Client-side only: hides the panel from casual visitors, not true security.
 * For production, replace with server auth (Supabase Auth / NextAuth).
 */
const FALLBACK_PIN = "change-me-now";

export function getAdminPin(): string {
  return (
    (typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_ADMIN_PIN?.trim()) ||
    FALLBACK_PIN
  );
}

const SESSION_KEY = "amazin-admin-auth";

export function isAdminAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function loginAdmin(pin: string): boolean {
  if (pin === getAdminPin()) {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    return true;
  }
  return false;
}

export function logoutAdmin(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}
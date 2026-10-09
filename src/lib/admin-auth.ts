/** Change this PIN before going fully public — only you should know it */
export const ADMIN_PIN = "amazin2026";

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
  if (pin === ADMIN_PIN) {
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

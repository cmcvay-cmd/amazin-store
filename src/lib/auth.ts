/** Simple accounts: name, address, contact, password + unique Amazin ID. No email required. */

export type UserAccount = {
  id: string; // unique signing ID e.g. AMZ-A7K9X2
  name: string;
  address: string;
  contact: string; // phone or any contact text — optional uniqueness
  passwordHash: string;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  name: string;
  address: string;
  contact: string;
};

const USERS_KEY = "amazin-users";
const SESSION_KEY = "amazin-session";

function simpleHash(s: string): string {
  // Lightweight client hash (not crypto-grade). Demo only.
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return "h" + (h >>> 0).toString(16);
}

function loadUsers(): UserAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: UserAccount[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/** Generate unique Amazin ID: AMZ-XXXXXX */
export function generateUserId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return "AMZ-" + code;
}

export function registerUser(input: {
  name: string;
  address: string;
  contact: string;
  password: string;
}): { ok: true; user: SessionUser } | { ok: false; error: string } {
  const name = input.name.trim();
  const address = input.address.trim();
  const contact = input.contact.trim();
  const password = input.password;

  if (!name) return { ok: false, error: "Name is required." };
  if (!address) return { ok: false, error: "Address is required." };
  if (password.length < 4)
    return { ok: false, error: "Password must be at least 4 characters." };

  const users = loadUsers();
  let id = generateUserId();
  // Ensure unique
  let tries = 0;
  while (users.some((u) => u.id === id) && tries < 20) {
    id = generateUserId();
    tries++;
  }

  const account: UserAccount = {
    id,
    name,
    address,
    contact,
    passwordHash: simpleHash(password + ":" + id),
    createdAt: new Date().toISOString(),
  };
  users.push(account);
  saveUsers(users);

  const session: SessionUser = { id, name, address, contact };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, user: session };
}

export function loginUser(
  id: string,
  password: string
): { ok: true; user: SessionUser } | { ok: false; error: string } {
  const cleanId = id.trim().toUpperCase();
  const users = loadUsers();
  const found = users.find((u) => u.id.toUpperCase() === cleanId);
  if (!found) return { ok: false, error: "Account not found. Check your Amazin ID." };
  if (found.passwordHash !== simpleHash(password + ":" + found.id)) {
    return { ok: false, error: "Wrong password." };
  }
  const session: SessionUser = {
    id: found.id,
    name: found.name,
    address: found.address,
    contact: found.contact,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, user: session };
}

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

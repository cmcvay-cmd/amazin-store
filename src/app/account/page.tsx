"use client";

import { useCallback, useState } from "react";
import Header from "@/components/Header";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useAuth } from "@/context/AuthContext";

type Mode = "menu" | "login" | "register";

export default function AccountPage() {
  const { user, ready, login, register, logout } = useAuth();
  const [welcomeDone, setWelcomeDone] = useState(false);
  const [mode, setMode] = useState<Mode>("menu");
  const [error, setError] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const finishWelcome = useCallback(() => setWelcomeDone(true), []);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
        Loading…
      </div>
    );
  }

  // Welcome only when not logged in
  if (!user && !welcomeDone && !createdId) {
    return <WelcomeScreen onDone={finishWelcome} />;
  }

  if (user && !createdId) {
    return (
      <div className="page-enter flex flex-1 flex-col">
        <Header showBack showSearch={false} title="Account" />
        <div className="mx-auto w-full max-w-md space-y-4 px-4 py-6">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5">
            <p className="text-xs text-[var(--text-muted)]">Your Amazin ID</p>
            <p className="mt-1 font-mono text-xl font-bold tracking-wide text-[var(--accent-pink)]">
              {user.id}
            </p>
            <p className="mt-4 text-sm">
              <span className="text-[var(--text-muted)]">Name · </span>
              {user.name}
            </p>
            <p className="mt-1 text-sm">
              <span className="text-[var(--text-muted)]">Address · </span>
              {user.address}
            </p>
            {user.contact && (
              <p className="mt-1 text-sm">
                <span className="text-[var(--text-muted)]">Contact · </span>
                {user.contact}
              </p>
            )}
          </div>
          <p className="text-center text-xs text-[var(--text-muted)]">
            Save your Amazin ID — needed to sign in on other devices.
          </p>
          <button
            type="button"
            onClick={logout}
            className="btn-press w-full rounded-xl border border-[var(--border-subtle)] py-3 text-sm font-semibold text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (createdId) {
    return (
      <div className="page-enter flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-4xl">✓</div>
        <h1 className="text-xl font-bold">Account created</h1>
        <p className="text-sm text-[var(--text-muted)]">
          Your unique Amazin ID (save this):
        </p>
        <p className="rounded-xl bg-[var(--bg-card)] px-4 py-3 font-mono text-2xl font-bold tracking-wide text-[var(--accent-pink)]">
          {createdId}
        </p>
        <button
          type="button"
          onClick={() => setCreatedId(null)}
          className="btn-press mt-2 rounded-xl bg-[var(--accent-pink)] px-6 py-3 text-sm font-semibold text-white"
        >
          Continue
        </button>
      </div>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = login(loginId, loginPass);
    if (!res.ok) setError(res.error || "Login failed");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    const res = register({ name, address, contact, password });
    if (!res.ok) {
      setError(res.error || "Could not create account");
      return;
    }
    setCreatedId(res.userId || null);
  };

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Header showBack showSearch={false} title="Account" />
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-6">
        {mode === "menu" && (
          <div className="space-y-3">
            <p className="mb-4 text-center text-sm text-[var(--text-muted)]">
              Create an account with name, address & password. No email needed —
              you get a unique Amazin ID.
            </p>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className="btn-press w-full rounded-xl bg-[var(--accent-pink)] py-3.5 text-sm font-bold text-white"
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className="btn-press w-full rounded-xl border border-[var(--border-subtle)] py-3.5 text-sm font-semibold text-white"
            >
              Sign in with Amazin ID
            </button>
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-3">
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="text-xs text-[var(--accent-pink)]"
            >
              ← Back
            </button>
            <h2 className="text-lg font-bold">Sign in</h2>
            <input
              required
              placeholder="Amazin ID (e.g. AMZ-A7K9X2)"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 font-mono text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            <input
              required
              type="password"
              placeholder="Password"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              className="btn-press w-full rounded-xl bg-[var(--accent-pink)] py-3 text-sm font-semibold text-white"
            >
              Sign in
            </button>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-3">
            <button
              type="button"
              onClick={() => setMode("menu")}
              className="text-xs text-[var(--accent-pink)]"
            >
              ← Back
            </button>
            <h2 className="text-lg font-bold">Create account</h2>
            <input
              required
              placeholder="Full name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            <textarea
              required
              rows={2}
              placeholder="Shipping address *"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            <input
              placeholder="Contact (optional)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            <input
              required
              type="password"
              placeholder="Password (min 4) *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            <input
              required
              type="password"
              placeholder="Confirm password *"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              className="btn-press w-full rounded-xl bg-[var(--accent-pink)] py-3 text-sm font-semibold text-white"
            >
              Create & get Amazin ID
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

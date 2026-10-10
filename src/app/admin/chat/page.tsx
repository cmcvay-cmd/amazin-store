"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
} from "@/lib/admin-auth";
import {
  getSupabase,
  isSupabaseConfigured,
  uploadChatImage,
  type ChatMessage,
  type ChatThread,
} from "@/lib/supabase";

export default function AdminChatPage() {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAuthed(isAdminAuthenticated());
  }, []);

  const loadThreads = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("chat_threads")
      .select("*")
      .order("updated_at", { ascending: false });
    if (!err && data) setThreads(data as ChatThread[]);
  }, []);

  const loadMessages = useCallback(async (tid: string) => {
    const supabase = getSupabase();
    if (!supabase) return;
    const { data, error: err } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("thread_id", tid)
      .order("created_at", { ascending: true });
    if (!err && data) setMessages(data as ChatMessage[]);
  }, []);

  useEffect(() => {
    if (!authed) return;
    loadThreads();
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-threads")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chat_threads" },
        () => loadThreads()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const row = payload.new as ChatMessage;
          if (row.thread_id === activeId) {
            setMessages((prev) =>
              prev.some((m) => m.id === row.id) ? prev : [...prev, row]
            );
          }
          loadThreads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [authed, activeId, loadThreads]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pin.trim())) {
      setAuthed(true);
      setPinError("");
    } else setPinError("Wrong PIN");
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !activeId) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const text = body.trim();
    setBody("");

    const { error: err } = await supabase.from("chat_messages").insert({
      thread_id: activeId,
      sender_role: "admin",
      sender_name: "Amazin Support",
      body: text,
    });
    if (err) {
      setError(err.message);
      setBody(text);
      return;
    }
    await supabase
      .from("chat_threads")
      .update({ last_message: text, updated_at: new Date().toISOString() })
      .eq("id", activeId);
  };

  const sendImage = async (file: File | null) => {
    if (!file || !activeId) return;
    setUploading(true);
    setError("");
    try {
      const imageUrl = await uploadChatImage(file);
      const supabase = getSupabase();
      if (!supabase) return;
      const caption = body.trim() || "📷 Photo";
      setBody("");
      const { error: err } = await supabase.from("chat_messages").insert({
        thread_id: activeId,
        sender_role: "admin",
        sender_name: "Amazin Support",
        body: caption,
        image_url: imageUrl,
      });
      if (err) {
        setError(err.message);
        return;
      }
      await supabase
        .from("chat_threads")
        .update({
          last_message: "📷 Photo",
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!authed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6"
        >
          <h1 className="text-center text-lg font-bold">Admin · Chat</h1>
          <input
            type="password"
            placeholder="Admin PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
          />
          {pinError && <p className="text-xs text-red-400">{pinError}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-[var(--accent-pink)] py-3 text-sm font-semibold text-white"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Configure Supabase env vars to enable live chat.
        </p>
        <Link href="/admin" className="text-[var(--accent-pink)]">
          ← Products
        </Link>
      </div>
    );
  }

  const active = threads.find((t) => t.id === activeId);

  return (
    <div className="page-enter flex flex-1 flex-col md:flex-row">
      <aside className="flex w-full flex-col border-b border-[var(--border-subtle)] md:w-72 md:border-b-0 md:border-r">
        <div className="flex h-14 items-center justify-between border-b border-[var(--border-subtle)] px-3">
          <h1 className="text-sm font-bold">Inbox</h1>
          <div className="flex gap-2 text-xs">
            <Link href="/admin" className="text-[var(--accent-pink)]">
              Products
            </Link>
            <button
              type="button"
              onClick={() => {
                logoutAdmin();
                setAuthed(false);
              }}
              className="text-[var(--text-muted)]"
            >
              Lock
            </button>
          </div>
        </div>
        <div className="max-h-40 overflow-y-auto md:max-h-none md:flex-1">
          {threads.length === 0 && (
            <p className="p-4 text-xs text-[var(--text-muted)]">
              No buyer chats yet
            </p>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={
                "block w-full border-b border-[var(--border-subtle)] px-3 py-3 text-left " +
                (activeId === t.id ? "bg-[var(--accent-pink)]/15" : "")
              }
            >
              <p className="truncate text-sm font-semibold">{t.buyer_name}</p>
              <p className="truncate text-[11px] text-[var(--text-muted)]">
                {t.last_message || "—"}
              </p>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex min-h-[50vh] flex-1 flex-col">
        {!activeId ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
            Select a conversation
          </div>
        ) : (
          <>
            <div className="border-b border-[var(--border-subtle)] px-4 py-3">
              <p className="font-semibold">{active?.buyer_name}</p>
              {active?.buyer_email && (
                <p className="text-xs text-[var(--text-muted)]">
                  {active.buyer_email}
                </p>
              )}
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
              {messages.map((m) => {
                const mine = m.sender_role === "admin";
                return (
                  <div
                    key={m.id}
                    className={
                      "flex " + (mine ? "justify-end" : "justify-start")
                    }
                  >
                    <div
                      className={
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm " +
                        (mine
                          ? "rounded-br-md bg-[var(--accent-pink)] text-white"
                          : "rounded-bl-md bg-[var(--bg-card)]")
                      }
                    >
                      <p className="mb-0.5 text-[10px] opacity-70">
                        {m.sender_name}
                      </p>
                      {m.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.image_url}
                          alt=""
                          className="mb-1 max-h-48 w-full rounded-lg object-cover"
                        />
                      )}
                      <p className="whitespace-pre-wrap">{m.body}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            {error && <p className="px-4 text-xs text-red-400">{error}</p>}
            {uploading && (
              <p className="px-4 text-xs text-[var(--text-muted)]">Uploading…</p>
            )}
            <form
              onSubmit={send}
              className="flex gap-2 border-t border-[var(--border-subtle)] p-3"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => sendImage(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] text-lg"
              >
                📷
              </button>
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Reply as support…"
                className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
              />
              <button
                type="submit"
                className="rounded-xl bg-[var(--accent-pink)] px-4 text-sm font-semibold text-white"
              >
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

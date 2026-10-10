"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import {
  getSupabase,
  isSupabaseConfigured,
  uploadChatImage,
  type ChatMessage,
} from "@/lib/supabase";

const THREAD_KEY = "amazin-chat-thread";

export default function BuyerChatPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const scrollBottom = () =>
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

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
    try {
      const saved = localStorage.getItem(THREAD_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          threadId: string;
          name: string;
          email?: string;
        };
        setThreadId(parsed.threadId);
        setName(parsed.name);
        setEmail(parsed.email || "");
        setReady(true);
        loadMessages(parsed.threadId);
      }
    } catch {
      /* ignore */
    }
  }, [loadMessages]);

  useEffect(() => {
    if (!threadId) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("messages:" + threadId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: "thread_id=eq." + threadId,
        },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages((prev) =>
            prev.some((m) => m.id === row.id) ? prev : [...prev, row]
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId]);

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  const startChat = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isSupabaseConfigured) {
      setError(
        "Chat is not configured. Add Supabase env vars on Vercel (see README)."
      );
      return;
    }
    if (!name.trim()) {
      setError("Enter your name to start chatting.");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;

    const { data, error: err } = await supabase
      .from("chat_threads")
      .insert({
        buyer_name: name.trim(),
        buyer_email: email.trim() || null,
        last_message: "Chat started",
      })
      .select("id")
      .single();

    if (err || !data) {
      setError(err?.message || "Could not start chat.");
      return;
    }

    const tid = data.id as string;
    setThreadId(tid);
    setReady(true);
    localStorage.setItem(
      THREAD_KEY,
      JSON.stringify({ threadId: tid, name: name.trim(), email: email.trim() })
    );

    await supabase.from("chat_messages").insert({
      thread_id: tid,
      sender_role: "buyer",
      sender_name: name.trim(),
      body: "Hi! I need help with my order.",
    });
    loadMessages(tid);
  };

  const sendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !threadId || !name) return;
    const supabase = getSupabase();
    if (!supabase) return;

    const text = body.trim();
    setBody("");

    const { error: err } = await supabase.from("chat_messages").insert({
      thread_id: threadId,
      sender_role: "buyer",
      sender_name: name,
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
      .eq("id", threadId);
  };

  const sendImage = async (file: File | null) => {
    if (!file || !threadId || !name) return;
    setError("");
    setUploading(true);
    try {
      let imageUrl: string;
      if (isSupabaseConfigured) {
        imageUrl = await uploadChatImage(file);
      } else {
        throw new Error("Supabase required for chat images");
      }
      const supabase = getSupabase();
      if (!supabase) return;

      const caption = body.trim() || "📷 Photo";
      setBody("");

      const { error: err } = await supabase.from("chat_messages").insert({
        thread_id: threadId,
        sender_role: "buyer",
        sender_name: name,
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
        .eq("id", threadId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!ready) {
    return (
      <div className="page-enter flex flex-1 flex-col">
        <Header showBack showSearch={false} title="Chat with us" />
        <form
          onSubmit={startChat}
          className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 px-4 py-8"
        >
          <p className="text-center text-sm text-[var(--text-muted)]">
            Message the Amazin team about products, orders, or shipping.
          </p>
          <input
            required
            placeholder="Your name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
          />
          <input
            type="text"
            placeholder="Contact optional"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            className="btn-press rounded-xl bg-[var(--accent-pink)] py-3 text-sm font-semibold text-white"
          >
            Start chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Header showBack showSearch={false} title="Chat" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {messages.map((m) => {
            const mine = m.sender_role === "buyer";
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
                      : "rounded-bl-md bg-[var(--bg-card)] text-white")
                  }
                >
                  {!mine && (
                    <p className="mb-0.5 text-[10px] font-semibold text-[var(--accent-pink)]">
                      {m.sender_name}
                    </p>
                  )}
                  {m.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.image_url}
                      alt="Sent"
                      className="mb-1 max-h-48 w-full rounded-lg object-cover"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{m.body}</p>
                  <p className="mt-1 text-[9px] opacity-60">
                    {new Date(m.created_at).toLocaleTimeString()}
                  </p>
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
          onSubmit={sendText}
          className="flex gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3"
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
            title="Send photo"
          >
            📷
          </button>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
          />
          <button
            type="submit"
            className="btn-press rounded-xl bg-[var(--accent-pink)] px-4 text-sm font-semibold text-white"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

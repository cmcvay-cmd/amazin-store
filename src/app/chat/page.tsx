"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import { useAuth } from "@/context/AuthContext";
import {
  getSupabase,
  isSupabaseConfigured,
  uploadChatImage,
  type ChatMessage,
} from "@/lib/supabase";

const THREAD_KEY = "amazin-chat-thread-v2";

export default function BuyerChatPage() {
  const { user, ready: authReady } = useAuth();
  const searchParams = useSearchParams();
  const orderRefParam = searchParams.get("order") || "";
  const customPay = searchParams.get("customPay") === "1";

  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [booting, setBooting] = useState(true);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  /** Open or create THIS user's private thread only */
  const ensureThread = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setBooting(false);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setBooting(false);
      return;
    }

    // Prefer cached thread for this user
    try {
      const saved = localStorage.getItem(THREAD_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          threadId: string;
          userId: string;
        };
        if (parsed.userId === user.id) {
          setThreadId(parsed.threadId);
          await loadMessages(parsed.threadId);
          setBooting(false);
          // Optional: append order tag message
          if (orderRefParam || customPay) {
            await postSystemNote(
              parsed.threadId,
              user.name,
              orderRefParam,
              customPay
            );
          }
          return;
        }
      }
    } catch {
      /* ignore */
    }

    // Find existing thread for this Amazin ID
    const { data: existing } = await supabase
      .from("chat_threads")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      setThreadId(existing.id);
      localStorage.setItem(
        THREAD_KEY,
        JSON.stringify({ threadId: existing.id, userId: user.id })
      );
      await loadMessages(existing.id);
      if (orderRefParam || customPay) {
        await postSystemNote(existing.id, user.name, orderRefParam, customPay);
      }
      setBooting(false);
      return;
    }

    // Create new private thread
    const { data, error: err } = await supabase
      .from("chat_threads")
      .insert({
        buyer_name: user.name,
        buyer_email: user.contact || null,
        user_id: user.id,
        order_ref: orderRefParam || null,
        last_message: "Chat started",
      })
      .select("id")
      .single();

    if (err || !data) {
      setError(err?.message || "Could not open chat.");
      setBooting(false);
      return;
    }

    const tid = data.id as string;
    setThreadId(tid);
    localStorage.setItem(
      THREAD_KEY,
      JSON.stringify({ threadId: tid, userId: user.id })
    );

    await supabase.from("chat_messages").insert({
      thread_id: tid,
      sender_role: "buyer",
      sender_name: user.name,
      body: "Hi! I need help.",
    });

    if (orderRefParam || customPay) {
      await postSystemNote(tid, user.name, orderRefParam, customPay);
    }

    await loadMessages(tid);
    setBooting(false);
  }, [user, loadMessages, orderRefParam, customPay]);

  async function postSystemNote(
    tid: string,
    name: string,
    orderRef: string,
    isCustomPay: boolean
  ) {
    const supabase = getSupabase();
    if (!supabase) return;
    let note = "";
    if (isCustomPay) {
      note =
        "🔄 Custom payment requested — please share alternate bank / payment details.";
    }
    if (orderRef) {
      note =
        (note ? note + "\n" : "") +
        "🧾 Order tag: " +
        orderRef +
        " — support about this order.";
    }
    if (!note) return;
    await supabase.from("chat_messages").insert({
      thread_id: tid,
      sender_role: "buyer",
      sender_name: name,
      body: note,
    });
    await supabase
      .from("chat_threads")
      .update({
        order_ref: orderRef || null,
        last_message: note.slice(0, 80),
        updated_at: new Date().toISOString(),
      })
      .eq("id", tid);
  }

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setBooting(false);
      return;
    }
    ensureThread();
  }, [authReady, user, ensureThread]);

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

  const sendText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !threadId || !user) return;
    const supabase = getSupabase();
    if (!supabase) return;
    const text = body.trim();
    setBody("");
    const { error: err } = await supabase.from("chat_messages").insert({
      thread_id: threadId,
      sender_role: "buyer",
      sender_name: user.name,
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
    if (!file || !threadId || !user) return;
    setUploading(true);
    setError("");
    try {
      const imageUrl = await uploadChatImage(file);
      const supabase = getSupabase();
      if (!supabase) return;
      const caption = body.trim() || "📷 Photo";
      setBody("");
      const { error: err } = await supabase.from("chat_messages").insert({
        thread_id: threadId,
        sender_role: "buyer",
        sender_name: user.name,
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

  if (!authReady || booting) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-[var(--text-muted)]">
        Loading chat…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-enter flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <Header showBack showSearch={false} title="Chat" />
        <div className="mt-8 space-y-3">
          <p className="text-4xl">🔒</p>
          <h1 className="text-xl font-bold">Sign in required</h1>
          <p className="max-w-sm text-sm text-[var(--text-muted)]">
            Chat is private and linked to your Amazin account. Create an account
            or sign in to message support.
          </p>
          <Link
            href="/account"
            className="btn-press inline-block rounded-xl bg-[var(--accent-pink)] px-6 py-3 text-sm font-semibold text-white"
          >
            Go to Account
          </Link>
        </div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-[var(--text-muted)]">
          Chat needs Supabase env vars on Vercel.
        </p>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Header showBack showSearch={false} title="Support chat" />
      <div className="border-b border-[var(--border-subtle)] px-4 py-2 text-xs text-[var(--text-muted)]">
        Signed in as <span className="text-white">{user.name}</span>
        {" · "}
        <span className="font-mono text-[var(--accent-pink)]">{user.id}</span>
        {orderRefParam && (
          <span className="ml-2 rounded bg-[var(--accent-pink)]/20 px-1.5 py-0.5 text-[var(--accent-pink)]">
            Order {orderRefParam}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
          {messages.map((m) => {
            const mine = m.sender_role === "buyer";
            return (
              <div
                key={m.id}
                className={"flex " + (mine ? "justify-end" : "justify-start")}
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
                      alt=""
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
          >
            📷
          </button>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message support…"
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

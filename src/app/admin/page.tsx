"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import type { Product } from "@/lib/products";
import { CATEGORIES } from "@/lib/products";
import Link from "next/link";
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
} from "@/lib/admin-auth";
import { isSupabaseConfigured, uploadProductImage } from "@/lib/supabase";
import {
  loadPaymentMethods,
  savePaymentMethods,
  type PaymentMethod,
  DEFAULT_PAYMENT_METHODS,
} from "@/lib/payments";

const emptyForm = {
  name: "",
  brand: "",
  price: "",
  oldPrice: "",
  rating: "4.5",
  reviews: "0",
  emoji: "📦",
  image: "",
  description: "",
  category: "Electronics",
  stock: "10",
};

const emptyPay = {
  label: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  routingOrSort: "",
  extra: "",
  isDefault: false,
  active: true,
};

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 800_000) {
      reject(new Error("Image too large for local fallback (max ~800KB)."));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imgError, setImgError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"products" | "payments">("products");

  const [methods, setMethods] = useState<PaymentMethod[]>(DEFAULT_PAYMENT_METHODS);
  const [payForm, setPayForm] = useState(emptyPay);
  const [editingPayId, setEditingPayId] = useState<string | null>(null);
  const [showPayForm, setShowPayForm] = useState(false);

  useEffect(() => {
    setAuthed(isAdminAuthenticated());
  }, []);

  useEffect(() => {
    if (authed) setMethods(loadPaymentMethods());
  }, [authed]);

  const persistMethods = (next: PaymentMethod[]) => {
    setMethods(next);
    savePaymentMethods(next);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginAdmin(pin.trim())) {
      setAuthed(true);
      setPinError("");
      setPin("");
    } else {
      setPinError("Wrong PIN. Try again.");
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setAuthed(false);
  };

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      rating: String(p.rating),
      reviews: String(p.reviews),
      emoji: p.emoji,
      image: p.image ?? "",
      description: p.description,
      category: p.category,
      stock: String(p.stock),
    });
    setShowForm(true);
    setImgError("");
  };

  const handleImageFile = async (file: File | null) => {
    if (!file) return;
    setImgError("");
    setUploading(true);
    try {
      if (isSupabaseConfigured) {
        const url = await uploadProductImage(file);
        setForm((f) => ({ ...f, image: url }));
      } else {
        const dataUrl = await fileToDataUrl(file);
        setForm((f) => ({ ...f, image: dataUrl }));
      }
    } catch (err) {
      setImgError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim() || "GENERIC",
      price: parseFloat(form.price) || 0,
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
      rating: parseFloat(form.rating) || 4.5,
      reviews: parseInt(form.reviews, 10) || 0,
      emoji: form.emoji || "📦",
      image: form.image.trim() || undefined,
      description: form.description.trim() || "No description.",
      category: form.category,
      stock: parseInt(form.stock, 10) || 0,
    };

    if (editingId) {
      updateProduct(editingId, payload);
    } else {
      addProduct(payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setImgError("");
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const label = payForm.label.trim() || "Bank transfer";
    const entry: PaymentMethod = {
      id: editingPayId || "pay-" + Date.now(),
      label,
      bankName: payForm.bankName.trim(),
      accountName: payForm.accountName.trim(),
      accountNumber: payForm.accountNumber.trim(),
      routingOrSort: payForm.routingOrSort.trim() || undefined,
      extra: payForm.extra.trim() || undefined,
      isDefault: payForm.isDefault,
      active: payForm.active,
    };

    let next = [...methods];
    if (editingPayId) {
      next = next.map((m) => (m.id === editingPayId ? entry : m));
    } else {
      next.push(entry);
    }

    // Only one default
    if (entry.isDefault) {
      next = next.map((m) => ({
        ...m,
        isDefault: m.id === entry.id,
      }));
    }

    // Guarantee one default among active
    if (!next.some((m) => m.isDefault && m.active)) {
      const firstActive = next.find((m) => m.active);
      if (firstActive) {
        next = next.map((m) => ({
          ...m,
          isDefault: m.id === firstActive.id,
        }));
      }
    }

    persistMethods(next);
    setPayForm(emptyPay);
    setEditingPayId(null);
    setShowPayForm(false);
  };

  const startEditPay = (m: PaymentMethod) => {
    setEditingPayId(m.id);
    setPayForm({
      label: m.label,
      bankName: m.bankName,
      accountName: m.accountName,
      accountNumber: m.accountNumber,
      routingOrSort: m.routingOrSort || "",
      extra: m.extra || "",
      isDefault: m.isDefault,
      active: m.active,
    });
    setShowPayForm(true);
  };

  const deletePay = (id: string) => {
    if (id === "default") {
      alert("The built-in default method cannot be deleted. You can deactivate or edit it.");
      return;
    }
    if (!confirm("Delete this payment method?")) return;
    let next = methods.filter((m) => m.id !== id);
    if (!next.some((m) => m.isDefault && m.active)) {
      const first = next.find((m) => m.active);
      if (first) {
        next = next.map((m) => ({
          ...m,
          isDefault: m.id === first.id,
        }));
      }
    }
    persistMethods(next);
  };

  if (!authed) {
    return (
      <div className="page-enter flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-pink)]/20 text-2xl">
              🔒
            </div>
            <h1 className="text-lg font-bold text-white">Admin access</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Enter your PIN to manage products & payments
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              inputMode="text"
              autoComplete="current-password"
              placeholder="Admin PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-3 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            {pinError && <p className="text-xs text-red-400">{pinError}</p>}
            <button
              type="submit"
              className="btn-press w-full rounded-xl bg-[var(--accent-pink)] py-3 text-sm font-semibold text-white"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-1 flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4">
        <h1 className="text-lg font-bold">Admin</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/chat"
            className="rounded-lg px-2 py-1.5 text-[12px] font-medium text-[var(--accent-pink)]"
          >
            Chat
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg px-2 py-1.5 text-[12px] text-[var(--text-muted)] hover:text-white"
          >
            Lock
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-subtle)]">
        <button
          type="button"
          onClick={() => setTab("products")}
          className={
            "flex-1 py-3 text-sm font-semibold " +
            (tab === "products"
              ? "border-b-2 border-[var(--accent-pink)] text-[var(--accent-pink)]"
              : "text-[var(--text-muted)]")
          }
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => setTab("payments")}
          className={
            "flex-1 py-3 text-sm font-semibold " +
            (tab === "payments"
              ? "border-b-2 border-[var(--accent-pink)] text-[var(--accent-pink)]"
              : "text-[var(--text-muted)]")
          }
        >
          Payments
        </button>
      </div>

      {tab === "products" && (
        <>
          <div className="flex justify-end border-b border-[var(--border-subtle)] px-4 py-2">
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setShowForm((s) => !s);
                setImgError("");
              }}
              className="btn-press rounded-lg bg-[var(--accent-pink)] px-3 py-1.5 text-[13px] font-semibold text-white"
            >
              {showForm ? "Cancel" : "+ Add product"}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="animate-slide-up space-y-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
                />
                <input
                  placeholder="Brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
                />
                <input
                  placeholder="Emoji fallback"
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
                />
                <input
                  type="url"
                  placeholder="Image URL (https://...)"
                  value={form.image.startsWith("data:") ? "" : form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
                />
                <div className="col-span-2">
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">
                    Or upload image
                    {uploading ? " · Uploading…" : ""}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageFile(e.target.files?.[0] ?? null)
                    }
                    className="w-full text-sm text-[var(--text-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--accent-pink)] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
                  />
                  {imgError && (
                    <p className="mt-1 text-xs text-red-400">{imgError}</p>
                  )}
                  {form.image && (
                    <div className="mt-2 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.image}
                        alt="Preview"
                        className="h-16 w-16 rounded-lg border border-[var(--border-subtle)] object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="text-xs text-[var(--text-muted)] hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Old price"
                  value={form.oldPrice}
                  onChange={(e) =>
                    setForm({ ...form, oldPrice: e.target.value })
                  }
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
                />
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
                >
                  {CATEGORIES.filter((c) => c !== "All" && c !== "Deals").map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={2}
                  className="col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
                />
              </div>
              <button
                type="submit"
                className="btn-press w-full rounded-xl bg-[var(--accent-pink)] py-3 text-sm font-semibold text-white"
              >
                {editingId ? "Save Changes" : "Add Product"}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2.5 px-4 py-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3"
              >
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-2xl">{p.emoji}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    ${p.price.toFixed(2)} · Stock: {p.stock} · {p.category}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="text-sm font-medium text-[var(--accent-pink)]"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete "' + p.name + '"?'))
                      deleteProduct(p.id);
                  }}
                  className="text-sm text-[var(--text-muted)] hover:text-red-400"
                >
                  Del
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "payments" && (
        <>
          <div className="flex justify-end border-b border-[var(--border-subtle)] px-4 py-2">
            <button
              type="button"
              onClick={() => {
                setEditingPayId(null);
                setPayForm(emptyPay);
                setShowPayForm((s) => !s);
              }}
              className="btn-press rounded-lg bg-[var(--accent-pink)] px-3 py-1.5 text-[13px] font-semibold text-white"
            >
              {showPayForm ? "Cancel" : "+ Add payment method"}
            </button>
          </div>

          {showPayForm && (
            <form
              onSubmit={handlePaySubmit}
              className="space-y-3 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4"
            >
              <input
                required
                placeholder="Label (e.g. NGN GTBank, PayPal USD)"
                value={payForm.label}
                onChange={(e) =>
                  setPayForm({ ...payForm, label: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
              />
              <input
                required
                placeholder="Bank / provider name"
                value={payForm.bankName}
                onChange={(e) =>
                  setPayForm({ ...payForm, bankName: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
              />
              <input
                required
                placeholder="Account name"
                value={payForm.accountName}
                onChange={(e) =>
                  setPayForm({ ...payForm, accountName: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
              />
              <input
                required
                placeholder="Account number"
                value={payForm.accountNumber}
                onChange={(e) =>
                  setPayForm({ ...payForm, accountNumber: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
              />
              <input
                placeholder="Routing / Sort / SWIFT (optional)"
                value={payForm.routingOrSort}
                onChange={(e) =>
                  setPayForm({ ...payForm, routingOrSort: e.target.value })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
              />
              <textarea
                placeholder="Extra notes (IBAN, branch, etc.)"
                value={payForm.extra}
                onChange={(e) =>
                  setPayForm({ ...payForm, extra: e.target.value })
                }
                rows={2}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={payForm.isDefault}
                  onChange={(e) =>
                    setPayForm({ ...payForm, isDefault: e.target.checked })
                  }
                />
                Set as default (pre-selected at checkout)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={payForm.active}
                  onChange={(e) =>
                    setPayForm({ ...payForm, active: e.target.checked })
                  }
                />
                Active (visible to buyers)
              </label>
              <button
                type="submit"
                className="btn-press w-full rounded-xl bg-[var(--accent-pink)] py-3 text-sm font-semibold text-white"
              >
                {editingPayId ? "Save payment method" : "Add payment method"}
              </button>
            </form>
          )}

          <div className="flex flex-col gap-2.5 px-4 py-4">
            <p className="text-xs text-[var(--text-muted)]">
              Active methods appear on checkout. Buyers choose which account to
              pay into.
            </p>
            {methods.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">
                      {m.label}
                      {m.isDefault && (
                        <span className="ml-2 rounded bg-[var(--accent-pink)]/20 px-1.5 py-0.5 text-[10px] text-[var(--accent-pink)]">
                          DEFAULT
                        </span>
                      )}
                      {!m.active && (
                        <span className="ml-2 text-[10px] text-[var(--text-muted)]">
                          (hidden)
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {m.bankName} · {m.accountName}
                    </p>
                    <p className="font-mono text-xs">{m.accountNumber}</p>
                    {m.routingOrSort && (
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {m.routingOrSort}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEditPay(m)}
                      className="text-sm font-medium text-[var(--accent-pink)]"
                    >
                      Edit
                    </button>
                    {m.id !== "default" && (
                      <button
                        type="button"
                        onClick={() => deletePay(m.id)}
                        className="text-sm text-[var(--text-muted)] hover:text-red-400"
                      >
                        Del
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

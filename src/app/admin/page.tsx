"use client";

import { useEffect, useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import type { Product } from "@/lib/products";
import { CATEGORIES } from "@/lib/products";
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
} from "@/lib/admin-auth";

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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Limit size ~800KB to keep localStorage usable
    if (file.size > 800_000) {
      reject(new Error("Image too large (max ~800KB). Compress or use a URL."));
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

  useEffect(() => {
    setAuthed(isAdminAuthenticated());
  }, []);

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
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((f) => ({ ...f, image: dataUrl }));
    } catch (err) {
      setImgError(err instanceof Error ? err.message : "Upload failed");
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
              Enter your PIN to manage products
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
            {pinError && (
              <p className="text-xs text-red-400">{pinError}</p>
            )}
            <button
              type="submit"
              className="btn-press w-full rounded-xl bg-[var(--accent-pink)] py-3 text-sm font-semibold text-white"
            >
              Unlock
            </button>
          </form>
          <p className="text-center text-[11px] text-[var(--text-muted)]">
            Not public — only you should know this PIN
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter flex flex-1 flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4">
        <h1 className="text-lg font-bold">Admin · Products</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg px-2 py-1.5 text-[12px] text-[var(--text-muted)] hover:text-white"
          >
            Lock
          </button>
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
            {showForm ? "Cancel" : "+ Add"}
          </button>
        </div>
      </header>

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

            {/* Image URL */}
            <input
              type="url"
              placeholder="Image URL (https://...)"
              value={form.image.startsWith("data:") ? "" : form.image}
              onChange={(e) =>
                setForm({ ...form, image: e.target.value })
              }
              className="col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
            />

            {/* File upload */}
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-[var(--text-muted)]">
                Or upload image (max ~800KB)
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
                    className="h-16 w-16 rounded-lg object-cover border border-[var(--border-subtle)]"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: "" })}
                    className="text-xs text-[var(--text-muted)] hover:text-red-400"
                  >
                    Remove image
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
              onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
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
              onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                if (confirm(`Delete "${p.name}"?`)) deleteProduct(p.id);
              }}
              className="text-sm text-[var(--text-muted)] hover:text-red-400"
            >
              Del
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

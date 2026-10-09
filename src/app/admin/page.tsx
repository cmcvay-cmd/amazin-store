"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useProducts } from "@/context/ProductsContext";
import type { Product } from "@/lib/products";
import { CATEGORIES } from "@/lib/products";

const emptyForm = {
  name: "",
  brand: "",
  price: "",
  oldPrice: "",
  rating: "4.5",
  reviews: "0",
  emoji: "📦",
  description: "",
  category: "Electronics",
  stock: "10",
};

export default function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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
      description: p.description,
      category: p.category,
      stock: String(p.stock),
    });
    setShowForm(true);
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
  };

  return (
    <div className="page-enter flex flex-1 flex-col">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4">
        <h1 className="text-lg font-bold">Admin · Products</h1>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm((s) => !s);
          }}
          className="btn-press rounded-lg bg-[var(--accent-pink)] px-3 py-1.5 text-[13px] font-semibold text-white"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
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
              placeholder="Emoji"
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
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
            <span className="text-2xl">{p.emoji}</span>
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

"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/context/ProductsContext";
import { CATEGORIES } from "@/lib/products";
import Link from "next/link";

export default function HomePage() {
  const { products } = useProducts();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        category === "All" ||
        category === "Deals" ||
        p.category === category;
      const matchQ =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.brand.toLowerCase().includes(query.toLowerCase());
      if (category === "Deals") return !!p.oldPrice && matchQ;
      return matchCat && matchQ;
    });
  }, [products, category, query]);

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Header />

      {/* Search */}
      <div
        id="search"
        className="sticky top-14 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 pb-3 pt-1"
      >
        <div className="flex h-9 items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3">
          <span className="text-[var(--text-muted)]">⌕</span>
          <input
            type="search"
            placeholder="Search products, brands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--text-muted)]"
          />
        </div>
      </div>

      {/* Categories */}
      <div
        id="categories"
        className="scrollbar-hide flex gap-2.5 overflow-x-auto px-4 py-3"
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] transition-all btn-press ${
              category === c
                ? "bg-[var(--accent-pink)] font-semibold text-white"
                : "border border-[var(--border-subtle)] bg-[var(--bg-card)] font-medium text-[var(--text-secondary)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Hero */}
      <section className="px-4 pb-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent-pink-dark)] to-[#210d2e] p-5">
          <div className="hero-shimmer pointer-events-none absolute inset-0" />
          <span className="inline-block rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-bold text-white">
            ⚡ FLASH DEALS
          </span>
          <h2 className="mt-2 text-[22px] font-bold leading-7 text-white">
            Up to 50% Off
            <br />
            Selected Picks
          </h2>
          <Link
            href="#deals"
            className="btn-press mt-3 inline-flex rounded-[10px] bg-white px-3.5 py-2 text-[13px] font-semibold text-[var(--accent-pink-dark)]"
          >
            Shop Now →
          </Link>
        </div>
      </section>

      {/* Section title */}
      <div
        id="deals"
        className="flex items-center justify-between px-4 pb-2 pt-1"
      >
        <h2 className="text-lg font-bold text-white">
          {category === "All" ? "Today's Deals" : category}
        </h2>
        <span className="text-[13px] font-medium text-[var(--accent-pink)]">
          {filtered.length} items
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-6 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p, i) => (
          <div
            key={p.id}
            className="animate-fade-in"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="px-4 py-12 text-center text-[var(--text-muted)]">
          No products found. Try another search or category.
        </p>
      )}
    </div>
  );
}

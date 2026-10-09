"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  return (
    <Link
      href={`/product/${product.id}`}
      className="product-card group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-[var(--bg-elevated)] text-5xl sm:h-40">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="transition-transform duration-300 group-hover:scale-110">
            {product.emoji}
          </span>
        )}
        {discount && (
          <span className="absolute left-2 top-2 rounded-md bg-[var(--accent-pink)]/20 px-2 py-0.5 text-[11px] font-bold text-[var(--accent-pink)]">
            -{discount}%
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-white">
          {product.name}
        </h3>
        <p className="text-[11px] font-medium text-[var(--warning)]">
          ★ {product.rating.toFixed(1)}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-[var(--accent-pink)]">
            ${product.price.toFixed(2)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-[var(--text-muted)] line-through">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className={`btn-press mt-auto flex h-8 w-full items-center justify-center rounded-lg text-xs font-semibold transition-all ${
            added
              ? "bg-[var(--success)] text-white"
              : "bg-[var(--accent-pink)] text-white hover:brightness-110"
          }`}
        >
          {added ? "✓ Added" : "+ Add to Cart"}
        </button>
      </div>
    </Link>
  );
}

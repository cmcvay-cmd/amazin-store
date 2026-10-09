"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useProducts } from "@/context/ProductsContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function ProductPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { getProduct } = useProducts();
  const { addItem } = useCart();
  const router = useRouter();
  const product = getProduct(id);

  const [variant, setVariant] = useState(
    product?.variants?.[0] ?? ""
  );
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-[var(--text-muted)]">Product not found</p>
        <Link href="/" className="text-[var(--accent-pink)] font-medium">
          ← Back to store
        </Link>
      </div>
    );
  }

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round((1 - product.price / product.oldPrice) * 100)
      : null;

  const handleAdd = () => {
    addItem(product, 1, variant || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product, 1, variant || undefined);
    router.push("/cart");
  };

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Header showBack title="" showSearch={false} />

      {/* Gallery */}
      <div className="flex h-64 items-center justify-center bg-[var(--bg-elevated)] text-8xl sm:h-80">
        <span className="animate-fade-in">{product.emoji}</span>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        <p className="text-xs font-semibold tracking-wide text-[var(--accent-pink)]">
          {product.brand}
        </p>
        <h1 className="text-[22px] font-bold leading-7 text-white">
          {product.name}
        </h1>

        <div className="flex items-center gap-2">
          <span className="text-[var(--warning)]">★★★★★</span>
          <span className="text-sm text-[var(--text-muted)]">
            {product.rating} ({product.reviews.toLocaleString()} reviews)
          </span>
        </div>

        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-bold text-[var(--accent-pink)]">
            ${product.price.toFixed(2)}
          </span>
          {product.oldPrice && (
            <span className="text-base text-[var(--text-muted)] line-through">
              ${product.oldPrice.toFixed(2)}
            </span>
          )}
          {discount && (
            <span className="rounded-md bg-[var(--accent-pink)]/20 px-2 py-0.5 text-xs font-bold text-[var(--accent-pink)]">
              -{discount}%
            </span>
          )}
        </div>

        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          {product.description}
        </p>

        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {product.variants.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVariant(v)}
                className={`rounded-full px-3.5 py-2 text-[13px] transition-all btn-press ${
                  variant === v
                    ? "bg-[var(--accent-pink)] font-semibold text-white"
                    : "border border-[var(--border-subtle)] bg-[var(--bg-card)] font-medium text-[var(--text-secondary)]"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}

        <p className="text-xs text-[var(--text-muted)]">
          {product.stock > 0
            ? `${product.stock} in stock`
            : "Out of stock"}
        </p>
      </div>

      {/* Sticky CTA */}
      <div className="sticky bottom-16 z-20 flex gap-3 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 md:bottom-0">
        <button
          type="button"
          onClick={handleBuyNow}
          className="btn-press flex h-12 flex-1 items-center justify-center rounded-xl border border-[var(--accent-pink)] bg-[var(--bg-card)] text-sm font-semibold text-[var(--accent-pink)]"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className={`btn-press flex h-12 flex-[1.2] items-center justify-center rounded-xl text-sm font-semibold text-white transition-all ${
            added
              ? "bg-[var(--success)]"
              : "bg-[var(--accent-pink)] hover:brightness-110 disabled:opacity-40"
          }`}
        >
          {added ? "✓ Added to Cart" : "+ Add to Cart"}
        </button>
      </div>
    </div>
  );
}

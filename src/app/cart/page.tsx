"use client";

import Link from "next/link";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, subtotal, totalItems } =
    useCart();

  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Header
        showBack
        showSearch={false}
        title={`Your Cart (${totalItems})`}
      />

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16">
          <span className="text-5xl">🛒</span>
          <p className="text-[var(--text-muted)]">Your cart is empty</p>
          <Link
            href="/"
            className="btn-press rounded-xl bg-[var(--accent-pink)] px-6 py-3 text-sm font-semibold text-white"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-end px-4 pt-3">
            <button
              type="button"
              onClick={clearCart}
              className="text-sm font-medium text-[var(--accent-pink)]"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 px-4 py-3">
            {items.map((item, i) => (
              <div
                key={item.product.id}
                className="animate-slide-up flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-elevated)] text-3xl">
                  {item.product.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${item.product.id}`}
                    className="line-clamp-1 text-sm font-semibold text-white"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.variant}
                    </p>
                  )}
                  <p className="mt-0.5 text-[15px] font-bold text-[var(--accent-pink)]">
                    ${item.product.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="btn-press flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bg-elevated)] text-white"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.product.id, item.quantity + 1)
                    }
                    className="btn-press flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-pink)] text-white"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.product.id)}
                  className="text-[var(--text-muted)] text-sm hover:text-white"
                  aria-label="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="sticky bottom-16 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-4 md:bottom-0">
            <div className="mx-auto max-w-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Shipping</span>
                <span className="text-[var(--success)]">Free</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border-subtle)] pt-2">
                <span className="font-bold">Total</span>
                <span className="text-lg font-bold text-[var(--accent-pink)]">
                  ${total.toFixed(2)}
                </span>
              </div>
              <Link
                href="/checkout"
                className="btn-press mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--accent-pink)] text-[15px] font-semibold text-white hover:brightness-110"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

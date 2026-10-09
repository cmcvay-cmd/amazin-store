"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [proofName, setProofName] = useState<string | null>(null);

  const tax = subtotal * 0.08;
  const total = subtotal + tax;
  const orderRef = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  if (items.length === 0 && !confirmed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-[var(--text-muted)]">No items to checkout</p>
        <Link href="/" className="text-[var(--accent-pink)] font-medium">
          ← Back to store
        </Link>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="page-enter flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success)]/20 text-4xl animate-fade-in">
          ✓
        </div>
        <h1 className="text-2xl font-bold">Order Submitted</h1>
        <p className="max-w-sm text-sm text-[var(--text-secondary)]">
          We&apos;ll confirm your bank transfer within 1–2 business days.
          Reference: <strong className="text-white">{orderRef}</strong>
        </p>
        <Link
          href="/"
          className="btn-press mt-2 rounded-xl bg-[var(--accent-pink)] px-6 py-3 text-sm font-semibold text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleConfirm = () => {
    setConfirmed(true);
    clearCart();
  };

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Header showBack showSearch={false} title="Checkout" />

      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        {/* Payment method */}
        <section>
          <h2 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">
            Payment Method
          </h2>
          <div className="flex items-center gap-3 rounded-2xl border-2 border-[var(--accent-pink)] bg-[var(--bg-card)] p-3.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent-pink)] text-[10px] text-white">
              ●
            </span>
            <div>
              <p className="text-[15px] font-semibold">Bank Transfer</p>
              <p className="text-xs text-[var(--text-muted)]">
                Pay via direct bank transfer
              </p>
            </div>
          </div>
        </section>

        {/* Bank details */}
        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <h2 className="mb-3 text-[15px] font-bold">Transfer Details</h2>
          <dl className="space-y-2.5 text-sm">
            {[
              ["Bank Name", "Amazin Bank"],
              ["Account Name", "Amazin Store Ltd"],
              ["Account Number", "1234567890"],
              ["Routing / Sort Code", "021000021"],
              ["Reference", orderRef],
              ["Amount", `$${total.toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">{label}</dt>
                <dd
                  className={`font-semibold text-right ${
                    label === "Amount" ? "text-[var(--accent-pink)]" : ""
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Note */}
        <div className="rounded-xl bg-[var(--accent-pink)]/10 px-3.5 py-3 text-xs leading-relaxed text-[var(--accent-pink-soft)]">
          After transfer, upload proof of payment. Orders are confirmed within
          1–2 business days.
        </div>

        {/* Upload proof */}
        <label className="btn-press flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--accent-pink)] bg-[var(--bg-card)] text-sm font-semibold text-[var(--accent-pink)]">
          📎 {proofName ? proofName : "Upload Proof of Payment"}
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setProofName(f.name);
            }}
          />
        </label>

        {/* Order summary mini */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
            <span className="font-bold text-[var(--accent-pink)]">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="sticky bottom-16 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 md:bottom-0">
        <button
          type="button"
          onClick={handleConfirm}
          className="btn-press flex h-12 w-full items-center justify-center rounded-xl bg-[var(--accent-pink)] text-[15px] font-semibold text-white hover:brightness-110 animate-pulse-pink"
        >
          I have completed the transfer
        </button>
      </div>
    </div>
  );
}

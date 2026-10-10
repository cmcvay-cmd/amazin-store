"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { useCart } from "@/context/CartContext";
import type { AddressSuggestion } from "@/lib/address";

type GiftMode = "myself" | "gift";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [confirmed, setConfirmed] = useState(false);
  const [proofName, setProofName] = useState<string | null>(null);
  const [addressValid, setAddressValid] = useState(false);
  const [formError, setFormError] = useState("");

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [giftMode, setGiftMode] = useState<GiftMode>("myself");
  const [recipientName, setRecipientName] = useState("");
  const [address, setAddress] = useState("");
  const [addressMeta, setAddressMeta] = useState<AddressSuggestion | null>(
    null
  );
  const [countryNote, setCountryNote] = useState("");

  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? 12 : 0; // flat worldwide demo rate
  const total = subtotal + tax + shipping;
  const orderRef = useMemo(
    () => `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
    []
  );

  if (items.length === 0 && !confirmed) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-[var(--text-muted)]">No items to checkout</p>
        <Link href="/" className="font-medium text-[var(--accent-pink)]">
          ← Back to store
        </Link>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="page-enter flex flex-1 flex-col items-center justify-center gap-5 px-6 py-16 text-center">
        <div className="flex h-20 w-20 animate-fade-in items-center justify-center rounded-full bg-[var(--success)]/20 text-4xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold">Order Submitted</h1>
        <p className="max-w-sm text-sm text-[var(--text-secondary)]">
          We&apos;ll confirm your bank transfer within 1–2 business days.
          Reference: <strong className="text-white">{orderRef}</strong>
        </p>
        <p className="max-w-sm text-xs text-[var(--text-muted)]">
          Shipping to: {address}
          {giftMode === "gift" && recipientName
            ? ` · Gift for ${recipientName}`
            : ""}
        </p>
        <Link
          href="/chat"
          className="text-sm font-medium text-[var(--accent-pink)]"
        >
          Chat with us about your order →
        </Link>
        <Link
          href="/"
          className="btn-press mt-2 rounded-xl bg-[var(--accent-pink)] px-6 py-3 text-sm font-semibold text-white"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!buyerName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (giftMode === "gift" && !recipientName.trim()) {
      setFormError("Please enter the recipient name for gift orders.");
      return;
    }
    if (!address.trim() || !addressValid) {
      setFormError(
        "Please select a verified address from the suggestions (worldwide shipping supported)."
      );
      return;
    }

    // Persist order snapshot for admin/demo (localStorage)
    try {
      const orders = JSON.parse(localStorage.getItem("amazin-orders") || "[]");
      orders.unshift({
        ref: orderRef,
        buyerName,
        buyerEmail,
        buyerPhone,
        giftMode,
        recipientName: giftMode === "gift" ? recipientName : buyerName,
        address,
        addressMeta,
        countryNote,
        items,
        total,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("amazin-orders", JSON.stringify(orders.slice(0, 50)));
    } catch {
      /* ignore */
    }

    setConfirmed(true);
    clearCart();
  };

  return (
    <div className="page-enter flex flex-1 flex-col">
      <Header showBack showSearch={false} title="Checkout" />

      <form
        onSubmit={handleConfirm}
        className="flex flex-1 flex-col gap-4 px-4 py-4"
      >
        {/* Buyer details */}
        <section className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <h2 className="text-[15px] font-bold">Buyer details</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              placeholder="Full name *"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            <input
              type="email"
              placeholder="Email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              className="col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              className="col-span-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
          </div>

          <div>
            <p className="mb-2 text-xs text-[var(--text-muted)]">This order is</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGiftMode("myself")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
                  giftMode === "myself"
                    ? "bg-[var(--accent-pink)] text-white"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                }`}
              >
                For myself
              </button>
              <button
                type="button"
                onClick={() => setGiftMode("gift")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold ${
                  giftMode === "gift"
                    ? "bg-[var(--accent-pink)] text-white"
                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)]"
                }`}
              >
                Send as gift
              </button>
            </div>
          </div>

          {giftMode === "gift" && (
            <input
              required
              placeholder="Recipient full name *"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
          )}
        </section>

        {/* Shipping — worldwide */}
        <section className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold">Shipping address</h2>
            <span className="rounded-full bg-[var(--accent-pink)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--accent-pink)]">
              Worldwide
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">
            Type your address — we suggest full matches and validate them.
          </p>
          <AddressAutocomplete
            required
            value={address}
            onChange={(display, suggestion) => {
              setAddress(display);
              setAddressMeta(suggestion);
            }}
            onValidChange={setAddressValid}
          />
          <input
            placeholder="Apartment, suite, delivery notes (optional)"
            value={countryNote}
            onChange={(e) => setCountryNote(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
          />
        </section>

        {/* Payment */}
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

        <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <h2 className="mb-3 text-[15px] font-bold">Transfer Details</h2>
          <dl className="space-y-2.5 text-sm">
            {[
              ["Bank Name", "Amazin Bank"],
              ["Account Name", "Amazin Store Ltd"],
              ["Account Number", "1234567890"],
              ["Routing / Sort Code", "021000021"],
              ["Reference", orderRef],
              ["Subtotal", `$${subtotal.toFixed(2)}`],
              ["Tax (8%)", `$${tax.toFixed(2)}`],
              ["Worldwide shipping", `$${shipping.toFixed(2)}`],
              ["Amount", `$${total.toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-[var(--text-muted)]">{label}</dt>
                <dd
                  className={`text-right font-semibold ${
                    label === "Amount" ? "text-[var(--accent-pink)]" : ""
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="rounded-xl bg-[var(--accent-pink)]/10 px-3.5 py-3 text-xs leading-relaxed text-[var(--accent-pink-soft)]">
          After transfer, upload proof of payment. Orders are confirmed within
          1–2 business days. We ship worldwide.
        </div>

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

        {formError && (
          <p className="text-center text-xs text-red-400">{formError}</p>
        )}

        <button
          type="submit"
          className="btn-press mb-4 w-full rounded-xl bg-[var(--accent-pink)] py-3.5 text-sm font-bold text-white"
        >
          Confirm order · ${total.toFixed(2)}
        </button>
      </form>
    </div>
  );
}

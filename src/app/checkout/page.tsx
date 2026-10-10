"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import type { AddressSuggestion } from "@/lib/address";
import {
  activePaymentMethods,
  type PaymentMethod,
} from "@/lib/payments";

type GiftMode = "myself" | "gift";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { format, shippingUsd, currency } = useCurrency();

  const [confirmed, setConfirmed] = useState(false);
  const [proofName, setProofName] = useState<string | null>(null);
  const [addressValid, setAddressValid] = useState(false);
  const [formError, setFormError] = useState("");
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedPayId, setSelectedPayId] = useState<string>("");

  const [buyerName, setBuyerName] = useState(user?.name || "");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState(user?.contact || "");
  const [giftMode, setGiftMode] = useState<GiftMode>("myself");
  const [recipientName, setRecipientName] = useState("");
  const [address, setAddress] = useState(user?.address || "");
  const [addressMeta, setAddressMeta] = useState<AddressSuggestion | null>(
    null
  );

  useEffect(() => {
    const list = activePaymentMethods();
    setMethods(list);
    const def = list.find((m) => m.isDefault) || list[0];
    if (def) setSelectedPayId(def.id);
  }, []);

  const selectedPay =
    methods.find((m) => m.id === selectedPayId) || methods[0] || null;

  const tax = subtotal * 0.08;
  const shipping = shippingUsd;
  const total = subtotal + tax + shipping;
  const orderRef = useMemo(
    () => "ORD-" + Math.floor(10000 + Math.random() * 90000),
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
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success)]/20 text-4xl">
          ✓
        </div>
        <h1 className="text-2xl font-bold">Order Submitted</h1>
        <p className="max-w-sm text-sm text-[var(--text-secondary)]">
          Reference: <strong className="text-white">{orderRef}</strong>
        </p>
        <p className="max-w-sm text-xs text-[var(--text-muted)]">
          Total {format(total)} ({currency.code})
          {selectedPay ? " · via " + selectedPay.label : ""}
        </p>
        {user ? (
          <Link
            href={"/chat?order=" + encodeURIComponent(orderRef)}
            className="btn-press rounded-xl bg-[var(--accent-pink)] px-6 py-3 text-sm font-semibold text-white"
          >
            Chat support about this order
          </Link>
        ) : (
          <Link
            href="/account"
            className="text-sm font-medium text-[var(--accent-pink)]"
          >
            Create account to chat about your order →
          </Link>
        )}
        <Link href="/" className="text-sm text-[var(--text-muted)]">
          Continue shopping
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
      setFormError("Please select a verified address from the suggestions.");
      return;
    }
    if (!selectedPay) {
      setFormError("Please select a payment method.");
      return;
    }

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
        paymentMethodId: selectedPay.id,
        paymentLabel: selectedPay.label,
        paymentAccount: selectedPay.accountNumber,
        items,
        total,
        currency: currency.code,
        userId: user?.id,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(
        "amazin-orders",
        JSON.stringify(orders.slice(0, 50))
      );
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
        <p className="text-center text-xs text-[var(--text-muted)]">
          Prices in{" "}
          <span className="font-semibold text-[var(--accent-pink)]">
            {currency.code}
          </span>
          {currency.country ? " · based on your location" : ""}
        </p>

        <section className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <h2 className="text-[15px] font-bold">Buyer details</h2>
          <input
            required
            placeholder="Full name *"
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
          />
          <input
            placeholder="Email (optional)"
            value={buyerEmail}
            onChange={(e) => setBuyerEmail(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
          />
          <input
            placeholder="Phone / contact"
            value={buyerPhone}
            onChange={(e) => setBuyerPhone(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
          />
        </section>

        <section className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <h2 className="text-[15px] font-bold">Who is this for?</h2>
          <div className="flex gap-2">
            {(["myself", "gift"] as GiftMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setGiftMode(m)}
                className={
                  "flex-1 rounded-xl py-2.5 text-sm font-semibold " +
                  (giftMode === m
                    ? "bg-[var(--accent-pink)] text-white"
                    : "border border-[var(--border-subtle)] text-[var(--text-muted)]")
                }
              >
                {m === "myself" ? "For myself" : "Send as gift"}
              </button>
            ))}
          </div>
          {giftMode === "gift" && (
            <input
              required
              placeholder="Recipient name *"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-2.5 text-sm outline-none focus:border-[var(--accent-pink)]"
            />
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <h2 className="text-[15px] font-bold">Shipping address</h2>
          <AddressAutocomplete
            value={address}
            required
            onChange={(display, suggestion) => {
              setAddress(display);
              setAddressMeta(suggestion);
            }}
            onValidChange={setAddressValid}
          />
        </section>

        {/* Select payment method */}
        <section className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
          <h2 className="text-[15px] font-bold">Pay to</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Choose the account that works best for you
          </p>
          {methods.length === 0 && (
            <p className="text-xs text-red-400">
              No payment methods available. Admin must add one.
            </p>
          )}
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedPayId(m.id)}
              className={
                "w-full rounded-xl border p-3 text-left text-sm transition-colors " +
                (selectedPayId === m.id
                  ? "border-[var(--accent-pink)] bg-[var(--accent-pink)]/10"
                  : "border-[var(--border-subtle)]")
              }
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{m.label}</p>
                {m.isDefault && (
                  <span className="text-[10px] text-[var(--accent-pink)]">
                    DEFAULT
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {m.bankName} · {m.accountName}
              </p>
              <p className="font-mono text-xs">{m.accountNumber}</p>
            </button>
          ))}
        </section>

        {/* Full details of selected */}
        {selectedPay && (
          <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <h2 className="mb-3 text-[15px] font-bold">Transfer details</h2>
            <dl className="space-y-2.5 text-sm">
              {[
                ["Method", selectedPay.label],
                ["Bank / Provider", selectedPay.bankName],
                ["Account Name", selectedPay.accountName],
                ["Account Number", selectedPay.accountNumber],
                ...(selectedPay.routingOrSort
                  ? [["Routing / Sort / SWIFT", selectedPay.routingOrSort]]
                  : []),
                ...(selectedPay.extra
                  ? [["Notes", selectedPay.extra]]
                  : []),
                ["Reference", orderRef],
                ["Subtotal", format(subtotal)],
                ["Tax (8%)", format(tax)],
                ["Shipping", format(shipping)],
                ["Amount", format(total)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-[var(--text-muted)]">{label}</dt>
                  <dd
                    className={
                      "max-w-[60%] text-right font-semibold " +
                      (label === "Amount" ? "text-[var(--accent-pink)]" : "")
                    }
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <div className="rounded-xl bg-[var(--accent-pink)]/10 px-3.5 py-3 text-xs leading-relaxed text-[var(--accent-pink-soft)]">
          Use order reference <strong>{orderRef}</strong> on your transfer.
          Orders are confirmed within 1–2 business days.
        </div>

        <label className="btn-press flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--accent-pink)] bg-[var(--bg-card)] text-sm font-semibold text-[var(--accent-pink)]">
          📎 {proofName ? proofName : "Upload proof of payment"}
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
          Confirm order · {format(total)}
        </button>
      </form>
    </div>
  );
}

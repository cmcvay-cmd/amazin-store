/** Bank / payment methods managed from Admin, shown on Checkout. */

export type PaymentMethod = {
  id: string;
  label: string; // e.g. "USD Bank", "Nigeria NGN", "PayPal"
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingOrSort?: string;
  extra?: string; // SWIFT, IBAN, notes
  isDefault: boolean;
  active: boolean;
};

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "default",
    label: "Default bank transfer",
    bankName: "Pathward, N.A.",
    accountName: "Christina Ruiz",
    accountNumber: "70005723653569",
    routingOrSort: "073972181",
    extra: "",
    isDefault: true,
    active: true,
  },
];

const KEY = "amazin-payment-methods";

export function loadPaymentMethods(): PaymentMethod[] {
  if (typeof window === "undefined") return DEFAULT_PAYMENT_METHODS;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PAYMENT_METHODS;
    const parsed = JSON.parse(raw) as PaymentMethod[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_PAYMENT_METHODS;
    }
    // Always ensure at least one default exists
    const hasDefault = parsed.some((p) => p.isDefault && p.active);
    if (!hasDefault) {
      const first = parsed.find((p) => p.active) || parsed[0];
      if (first) first.isDefault = true;
    }
    return parsed;
  } catch {
    return DEFAULT_PAYMENT_METHODS;
  }
}

export function savePaymentMethods(methods: PaymentMethod[]) {
  localStorage.setItem(KEY, JSON.stringify(methods));
}

export function activePaymentMethods(): PaymentMethod[] {
  return loadPaymentMethods().filter((m) => m.active);
}

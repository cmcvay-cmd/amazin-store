/** Lightweight geo + FX for display. Base catalog prices are USD. */

export type CurrencyInfo = {
  code: string;
  symbol: string;
  rate: number; // multiply USD by this
  country?: string;
};

/** Approximate rates vs USD (update periodically). */
const RATES: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: "$", rate: 1 },
  EUR: { symbol: "€", rate: 0.92 },
  GBP: { symbol: "£", rate: 0.79 },
  NGN: { symbol: "₦", rate: 1550 },
  GHS: { symbol: "GH₵", rate: 15.5 },
  KES: { symbol: "KSh", rate: 129 },
  ZAR: { symbol: "R", rate: 18.2 },
  CAD: { symbol: "C$", rate: 1.36 },
  AUD: { symbol: "A$", rate: 1.53 },
  JPY: { symbol: "¥", rate: 149 },
  INR: { symbol: "₹", rate: 83 },
  AED: { symbol: "AED ", rate: 3.67 },
  SAR: { symbol: "SAR ", rate: 3.75 },
  BRL: { symbol: "R$", rate: 5.1 },
  MXN: { symbol: "MX$", rate: 17.2 },
  CNY: { symbol: "¥", rate: 7.2 },
  TRY: { symbol: "₺", rate: 32 },
  EGP: { symbol: "E£", rate: 48 },
  PKR: { symbol: "Rs", rate: 278 },
  PHP: { symbol: "₱", rate: 56 },
};

const COUNTRY_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  CA: "CAD",
  AU: "AUD",
  JP: "JPY",
  IN: "INR",
  AE: "AED",
  SA: "SAR",
  BR: "BRL",
  MX: "MXN",
  CN: "CNY",
  TR: "TRY",
  EG: "EGP",
  PK: "PKR",
  PH: "PHP",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  IE: "EUR",
  AT: "EUR",
  BE: "EUR",
  PT: "EUR",
};

export function currencyFromCountry(countryCode: string): CurrencyInfo {
  const code = COUNTRY_CURRENCY[countryCode.toUpperCase()] || "USD";
  const meta = RATES[code] || RATES.USD;
  return { code, symbol: meta.symbol, rate: meta.rate, country: countryCode };
}

export function formatMoney(usd: number, c: CurrencyInfo): string {
  const local = usd * c.rate;
  if (c.code === "JPY" || c.code === "NGN" || c.code === "KES") {
    return c.symbol + Math.round(local).toLocaleString();
  }
  return c.symbol + local.toFixed(2);
}

/** Detect country via free IP API (no key). Fallback USD. */
export async function detectCurrency(): Promise<CurrencyInfo> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return currencyFromCountry("US");
    const data = (await res.json()) as { country_code?: string };
    if (data.country_code) return currencyFromCountry(data.country_code);
  } catch {
    /* ignore */
  }
  return currencyFromCountry("US");
}

/** Flat shipping in USD by region (demo). */
export function shippingUsd(countryCode?: string): number {
  if (!countryCode) return 12;
  const cc = countryCode.toUpperCase();
  if (["US", "CA"].includes(cc)) return 8;
  if (["GB", "DE", "FR", "IT", "ES", "NL", "IE"].includes(cc)) return 10;
  if (["NG", "GH", "KE", "ZA"].includes(cc)) return 15;
  return 12;
}
